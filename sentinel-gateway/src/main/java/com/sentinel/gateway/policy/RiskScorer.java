package com.sentinel.gateway.policy;

import com.sentinel.common.model.RequestContext;
import com.sentinel.common.model.RiskScore;
import com.sentinel.common.model.JwtClaims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

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

    public void calculateAndInjectRisk(RequestContext context) {
        // In a real system, these signals would be populated by external services
        // (e.g., Redis rate limiters, Threat Intel APIs). 
        // For Phase 2, we simulate signals based on the RequestContext.

        double ipRisk = evaluateIpRisk(context.getSourceIp());
        double jwtRisk = evaluateJwtRisk(context.getJwtClaims());
        double rateRisk = 0.0; // Mock default
        double endpointRisk = 0.0; // Mock default

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
        // Mock: If IP starts with 192.168, it's safe (0.0). Otherwise, slight risk (0.2).
        if (ip.startsWith("192.168.") || ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")) {
            return 0.0;
        }
        return 0.2;
    }

    private double evaluateJwtRisk(JwtClaims claims) {
        if (claims == null) return 1.0; // High risk if no claims but reached here
        // Mock: If no roles, slight risk
        if (claims.getRoles() == null || claims.getRoles().isEmpty()) {
            return 0.5;
        }
        return 0.0;
    }
}
