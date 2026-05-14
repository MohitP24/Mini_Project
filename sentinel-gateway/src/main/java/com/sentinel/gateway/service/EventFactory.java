package com.sentinel.gateway.service;

import com.sentinel.common.entity.EventRecord;
import com.sentinel.common.model.Decision;
import com.sentinel.common.util.EventHashUtil;
import com.sentinel.common.util.TimestampUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.UUID;

@Component
public class EventFactory {

    @Value("${sentinel.gateway.version}")
    private String gatewayVersion;

    public EventRecord createEvent(
            String eventType,
            UUID sessionId,
            String userId,
            String rolesJson,
            String endpoint,
            String httpMethod,
            String sourceIp,
            String userAgent,
            String policyRuleId,
            Integer policyRuleVersion,
            UUID policyRuleSnapshotId,
            Float riskScore,
            String riskSignalsJson,
            Decision decision,
            String requestContextJson,
            String bodyHash
    ) {
        EventRecord event = EventRecord.builder()
                .timestampNs(TimestampUtil.getNowNs())
                .eventType(eventType)
                .sessionId(sessionId)
                .userId(userId)
                .roles(rolesJson)
                .endpoint(endpoint)
                .httpMethod(httpMethod)
                .sourceIp(sourceIp)
                .userAgent(userAgent)
                .policyRuleId(policyRuleId)
                .policyRuleVersion(policyRuleVersion)
                .policyRuleSnapshotId(policyRuleSnapshotId)
                .riskScore(riskScore)
                .riskSignals(riskSignalsJson)
                .decision(decision != null ? decision.name() : null)
                .requestContext(requestContextJson)
                .bodyHash(bodyHash)
                .gatewayVersion(gatewayVersion)
                .createdAt(OffsetDateTime.now())
                .build();
                
        event.setEventHash(EventHashUtil.computeHash(event));
        return event;
    }
}
