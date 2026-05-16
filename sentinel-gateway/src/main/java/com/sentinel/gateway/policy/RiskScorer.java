package com.sentinel.gateway.policy;

import com.sentinel.common.model.RequestContext;
import com.sentinel.common.model.RiskScore;
import com.sentinel.common.model.JwtClaims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RiskScorer {

    @Value("${sentinel.risk.weight.ip-reputation:0.4}")
    private double weightIpReputation;

    @Value("${sentinel.risk.weight.request-rate:0.3}")
    private double weightRequestRate;

    @Value("${sentinel.risk.weight.jwt-anomaly:0.2}")
    private double weightJwtAnomaly;

    @Value("${sentinel.risk.weight.endpoint-frequency:0.1}")
    private double weightEndpointFrequency;

    private final Map<String, RateData> rateLimiter = new ConcurrentHashMap<>();

    private static class RateData {
        AtomicInteger count = new AtomicInteger(1);
        long windowStart = System.currentTimeMillis();
    }

    // Known malicious IPs from threat intel (matching our generator)
    private static final Set<String> HIGH_RISK_IPS = Set.of(
        "198.51.100.7",   // Known bad actor
        "45.33.32.156",   // Scanner
        "185.220.101.42"  // Tor Exit Node
    );

    public void calculateAndInjectRisk(RequestContext context) {
        String ip = context.getSourceIp();
        
        double ipRisk = evaluateIpRisk(ip);
        double jwtRisk = evaluateJwtRisk(context.getJwtClaims());
        double rateRisk = evaluateRateRisk(ip); 
        double endpointRisk = evaluateEndpointRisk(context.getEndpoint());

        double totalScore = (ipRisk * weightIpReputation) +
                            (rateRisk * weightRequestRate) +
                            (jwtRisk * weightJwtAnomaly) +
                            (endpointRisk * weightEndpointFrequency);

        // Normalize between 0.0 and 1.0
        totalScore = Math.max(0.0, Math.min(1.0, totalScore));

        Map<String, Double> signals = new HashMap<>();
        signals.put("ipReputation", ipRisk);
        signals.put("jwtAnomaly", jwtRisk);
        signals.put("requestRate", rateRisk);
        signals.put("endpointFrequency", endpointRisk);

        RiskScore riskScore = new RiskScore(totalScore, signals);
        context.setCalculatedRisk(riskScore);
    }

    private double evaluateIpRisk(String ip) {
        if (ip == null) return 1.0;
        if (HIGH_RISK_IPS.contains(ip)) return 1.0; // 100% IP risk for known bad actors
        
        if (ip.startsWith("192.168.") || ip.equals("127.0.0.1") || ip.equals("10.0.0.5")) {
            return 0.0; // Trusted internal/admin IPs
        }
        return 0.3; // Default unknown external IP
    }

    private double evaluateJwtRisk(JwtClaims claims) {
        if (claims == null) return 1.0; // High risk if reaching protected route without claims
        if (claims.getRoles() == null || claims.getRoles().isEmpty()) {
            return 0.8; // User has no roles, highly anomalous
        }
        return 0.0;
    }

    private double evaluateRateRisk(String ip) {
        if (ip == null) return 0.0;
        
        long now = System.currentTimeMillis();
        RateData data = rateLimiter.compute(ip, (k, v) -> {
            if (v == null || now - v.windowStart > 5000) { // 5 second rolling window
                return new RateData();
            }
            v.count.incrementAndGet();
            return v;
        });

        int requestsInWindow = data.count.get();
        // If more than 5 requests in 5 seconds, it's a flood
        if (requestsInWindow > 10) return 1.0;
        if (requestsInWindow > 5) return 0.7;
        if (requestsInWindow > 3) return 0.3;
        return 0.0;
    }

    private double evaluateEndpointRisk(String endpoint) {
        if (endpoint == null) return 0.0;
        // Sensitive endpoints carry inherently higher risk if repeatedly hit
        if (endpoint.contains("/admin/")) return 0.8;
        if (endpoint.contains("/payments/")) return 0.5;
        return 0.0;
    }
}
