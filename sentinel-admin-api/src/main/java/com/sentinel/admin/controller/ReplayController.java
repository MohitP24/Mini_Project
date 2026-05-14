package com.sentinel.admin.controller;

import com.sentinel.common.dto.ReplayReportDTO;
import com.sentinel.common.entity.PolicyRule;
import com.sentinel.admin.service.ReplayService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/replay")
public class ReplayController {

    private final ReplayService replayService;

    public ReplayController(ReplayService replayService) {
        this.replayService = replayService;
    }

    @PostMapping
    public ReplayReportDTO runReplay(
            @RequestBody PolicyRule proposedRule,
            @RequestParam(defaultValue = "100") int limit) {
        return replayService.replayPolicy(proposedRule, limit);
    }
}
