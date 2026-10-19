package com.kassa.api.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {

    private UUID id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private Instant createdAt;
}
