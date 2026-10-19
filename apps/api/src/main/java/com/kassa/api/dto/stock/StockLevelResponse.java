package com.kassa.api.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLevelResponse {

    private UUID id;
    private UUID shopId;
    private UUID productId;
    private String productName;
    private String productSku;
    private BigDecimal sellPrice;
    private int quantity;
    private int alertThreshold;
    private boolean belowAlert;
}
