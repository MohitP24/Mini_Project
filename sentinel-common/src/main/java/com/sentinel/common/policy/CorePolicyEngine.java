package com.sentinel.common.policy;

import com.sentinel.common.model.RequestContext;
import java.util.List;

public class CorePolicyEngine {

    public static boolean evaluateConditions(List<Condition> conditions, RequestContext context) {
        if (conditions == null || conditions.isEmpty()) {
            return false;
        }

        for (Condition condition : conditions) {
            if (!evaluateCondition(condition, context)) {
                return false;
            }
        }
        return true;
    }

    private static boolean evaluateCondition(Condition condition, RequestContext context) {
        String type = condition.getType();
        String value = condition.getValue();

        if ("ip".equalsIgnoreCase(type)) {
            if (context.getSourceIp() == null) return false;
            // Support exact match or CIDR
            if (value.contains("/")) {
                return isIpInCidr(context.getSourceIp(), value);
            }
            return context.getSourceIp().equals(value);
        } else if ("role".equalsIgnoreCase(type)) {
            return context.getRoles() != null && context.getRoles().contains(value);
        } else if ("endpoint".equalsIgnoreCase(type)) {
            return context.getEndpoint() != null && context.getEndpoint().contains(value);
        } else if ("risk".equalsIgnoreCase(type)) {
            try {
                double threshold = Double.parseDouble(value);
                return context.getRiskScore() != null && context.getRiskScore() >= threshold;
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

    private static boolean isIpInCidr(String ip, String cidr) {
        try {
            String[] parts = cidr.split("/");
            String baseIp = parts[0];
            int prefix = Integer.parseInt(parts[1]);
            
            long ipLong = ipToLong(ip);
            long baseIpLong = ipToLong(baseIp);
            long mask = -1L << (32 - prefix);
            
            return (ipLong & mask) == (baseIpLong & mask);
        } catch (Exception e) {
            return ip.equals(cidr);
        }
    }

    private static long ipToLong(String ip) {
        String[] octets = ip.split("\\.");
        long result = 0;
        for (int i = 0; i < 4; i++) {
            result |= (Long.parseLong(octets[i]) << (24 - (8 * i)));
        }
        return result & 0xFFFFFFFFL;
    }
}
