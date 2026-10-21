package com.kassa.api.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlertResponse {

    private UUID productId;
    private String productName;
    private String sku;
    private int currentStock;
    private int alertThreshold;
    private UUID shopId;
    private String shopName;
}
