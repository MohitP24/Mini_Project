package com.sentinel.gateway.policy;

import com.sentinel.common.entity.PolicyRule;
import com.sentinel.gateway.repository.PolicyRuleRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Service
@EnableScheduling
@Slf4j
public class PolicyCacheManager {

    private final PolicyRuleRepository repository;
    private List<PolicyRule> cachedRules;
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    public PolicyCacheManager(PolicyRuleRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void init() {
        refreshCache();
    }

    // Refresh every 2 seconds as specified by POLICY_CACHE_TTL_SECONDS
    @Scheduled(fixedRateString = "${sentinel.policy.cache-ttl-ms:2000}")
    public void refreshCache() {
        try {
            List<PolicyRule> activeRules = repository.findByActiveTrueOrderByPriorityDesc();
            lock.writeLock().lock();
            try {
                this.cachedRules = activeRules;
            } finally {
                lock.writeLock().unlock();
            }
            log.debug("Refreshed policy cache. Active rules: {}", activeRules.size());
        } catch (Exception e) {
            log.error("Failed to refresh policy cache", e);
        }
    }

    public List<PolicyRule> getActiveRules() {
        lock.readLock().lock();
        try {
            return this.cachedRules != null ? this.cachedRules : List.of();
        } finally {
            lock.readLock().unlock();
        }
    }
}
