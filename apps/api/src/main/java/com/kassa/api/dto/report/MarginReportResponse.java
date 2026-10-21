package com.kassa.api.dto.report;

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
public class MarginReportResponse {

    private UUID productId;
    private String productName;
    private String sku;
    private BigDecimal buyPrice;
    private BigDecimal sellPrice;
    private BigDecimal marginPerUnit;
    private BigDecimal marginPercent;
    private long totalSold;
    private BigDecimal totalMargin;
}
