package com.kassa.api.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {

    private BigDecimal totalRevenue;
    private BigDecimal totalTax;
    private BigDecimal totalPaid;
    private BigDecimal totalDue;
    private long invoiceCount;
    private List<RevenuePeriod> periods;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenuePeriod {
        private String period;
        private BigDecimal revenue;
        private BigDecimal tax;
        private long count;
    }
}
