package com.sentinel.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class PagedResponseDTO<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
