package com.sentinel.admin.repository;

import com.sentinel.common.entity.PolicyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyRuleRepository extends JpaRepository<PolicyRule, String> {
    List<PolicyRule> findByActiveTrueOrderByPriorityDesc();
}
