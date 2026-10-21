package com.kassa.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginatedResponse<T> {

    private List<T> data;
    private long total;
    private int page;
    private int limit;
    private int totalPages;

    public static <T> PaginatedResponse<T> from(Page<T> springPage) {
        return PaginatedResponse.<T>builder()
                .data(springPage.getContent())
                .total(springPage.getTotalElements())
                .page(springPage.getNumber())
                .limit(springPage.getSize())
                .totalPages(springPage.getTotalPages())
                .build();
    }
}
