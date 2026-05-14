package com.sentinel.admin.controller;

import com.sentinel.common.dto.PagedResponseDTO;
import com.sentinel.common.entity.EventRecord;
import com.sentinel.admin.service.EventService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/admin/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public PagedResponseDTO<EventRecord> getEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sourceIp,
            @RequestParam(required = false) String decision,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endTime
    ) {
        return eventService.getEvents(page, size, sourceIp, decision, startTime, endTime);
    }
}
