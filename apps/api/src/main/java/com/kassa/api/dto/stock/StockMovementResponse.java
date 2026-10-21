package com.kassa.api.dto.stock;

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
public class StockMovementResponse {

    private UUID id;
    private UUID shopId;
    private String shopName;
    private UUID productId;
    private String productName;
    private String type;
    private int quantity;
    private String reason;
    private UUID referenceId;
    private UUID createdBy;
    private String userName;
    private Instant createdAt;
}
