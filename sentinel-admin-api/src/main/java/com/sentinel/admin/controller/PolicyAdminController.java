package com.sentinel.admin.controller;

import com.sentinel.common.entity.PolicyRule;
import com.sentinel.admin.service.PolicyAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/policies")
public class PolicyAdminController {

    private final PolicyAdminService policyAdminService;

    public PolicyAdminController(PolicyAdminService policyAdminService) {
        this.policyAdminService = policyAdminService;
    }

    @GetMapping
    public List<PolicyRule> getAllPolicies() {
        return policyAdminService.getAllPolicies();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyRule> getPolicy(@PathVariable("id") String id) {
        return policyAdminService.getPolicy(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PolicyRule createPolicy(@Valid @RequestBody PolicyRule rule) {
        return policyAdminService.createOrUpdatePolicy(rule);
    }

    @PutMapping("/{id}")
    public PolicyRule updatePolicy(@PathVariable("id") String id, @Valid @RequestBody PolicyRule rule) {
        rule.setRuleId(id);
        return policyAdminService.createOrUpdatePolicy(rule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivatePolicy(@PathVariable("id") String id) {
        policyAdminService.deactivatePolicy(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/simulate")
    public PolicyAdminService.SimulationResult simulate(@RequestBody java.util.Map<String, String> request) {
        return policyAdminService.simulateProposedPolicy(request.get("conditions"), request.get("scope"));
    }
}
