package com.kassa.api.dto.product;

import jakarta.validation.constraints.NotBlank;
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
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    private String barcode;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    private UUID categoryId;

    private String unit;

    private BigDecimal buyPrice;

    private BigDecimal sellPrice;

    private BigDecimal tvaRate;

    private Integer alertThreshold;

    private String photoUrl;

    private Boolean active;
}
