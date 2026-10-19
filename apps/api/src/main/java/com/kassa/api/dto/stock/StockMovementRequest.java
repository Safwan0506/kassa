package com.kassa.api.dto.stock;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementRequest {

    @NotNull(message = "Shop ID is required")
    private UUID shopId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Movement type is required")
    private String type;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String reason;
}
