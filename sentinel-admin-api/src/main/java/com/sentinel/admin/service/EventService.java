package com.sentinel.admin.service;

import com.sentinel.common.dto.PagedResponseDTO;
import com.sentinel.common.entity.EventRecord;
import com.sentinel.admin.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public PagedResponseDTO<EventRecord> getEvents(
            int page, int size, String sourceIp, String decision,
            OffsetDateTime startTime, OffsetDateTime endTime) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestampNs"));

        Specification<EventRecord> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(sourceIp)) {
                predicates.add(cb.equal(root.get("sourceIp"), sourceIp));
            }
            if (StringUtils.hasText(decision)) {
                predicates.add(cb.equal(root.get("decision"), decision));
            }
            if (startTime != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startTime));
            }
            if (endTime != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endTime));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EventRecord> result = eventRepository.findAll(spec, pageRequest);

        PagedResponseDTO<EventRecord> response = new PagedResponseDTO<>();
        response.setContent(result.getContent());
        response.setPage(result.getNumber());
        response.setSize(result.getSize());
        response.setTotalElements(result.getTotalElements());
        response.setTotalPages(result.getTotalPages());

        return response;
    }
}
