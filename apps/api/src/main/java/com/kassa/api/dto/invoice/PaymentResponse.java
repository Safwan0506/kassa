package com.kassa.api.dto.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private UUID id;
    private String method;
    private BigDecimal amount;
    private String reference;
    private String notes;
    private UUID receivedBy;
    private Instant createdAt;
}
