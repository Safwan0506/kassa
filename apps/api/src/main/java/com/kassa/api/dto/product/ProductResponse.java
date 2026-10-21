package com.kassa.api.dto.product;

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
public class ProductResponse {

    private UUID id;
    private String sku;
    private String barcode;
    private String name;
    private String description;
    private UUID categoryId;
    private String categoryName;
    private UUID supplierId;
    private String supplierName;
    private String unit;
    private BigDecimal buyPrice;
    private BigDecimal sellPrice;
    private BigDecimal tvaRate;
    private int alertThreshold;
    private String photoUrl;
    private boolean active;
    private Instant createdAt;
}
