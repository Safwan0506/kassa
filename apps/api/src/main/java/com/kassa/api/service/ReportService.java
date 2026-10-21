package com.kassa.api.service;

import com.kassa.api.dto.report.*;
import com.kassa.api.entity.Invoice;
import com.kassa.api.entity.InvoiceLine;
import com.kassa.api.entity.MovementType;
import com.kassa.api.entity.StockMovement;
import com.kassa.api.repository.InvoiceRepository;
import com.kassa.api.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(UUID orgId, UUID shopId, LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Invoice> invoices = invoiceRepository.findForReport(orgId, shopId, fromInstant, toInstant);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalDue = BigDecimal.ZERO;

        Map<String, RevenueReportResponse.RevenuePeriod> periodMap = new TreeMap<>();
        DateTimeFormatter dayFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Invoice inv : invoices) {
            totalRevenue = totalRevenue.add(inv.getSubtotal());
            totalTax = totalTax.add(inv.getTaxTotal());
            totalPaid = totalPaid.add(inv.getAmountPaid());
            totalDue = totalDue.add(inv.getAmountDue());

            String day = inv.getCreatedAt().atOffset(ZoneOffset.UTC).format(dayFormat);
            periodMap.compute(day, (k, v) -> {
                if (v == null) {
                    return RevenueReportResponse.RevenuePeriod.builder()
                            .period(day)
                            .revenue(inv.getSubtotal())
                            .tax(inv.getTaxTotal())
                            .count(1)
                            .build();
                }
                v.setRevenue(v.getRevenue().add(inv.getSubtotal()));
                v.setTax(v.getTax().add(inv.getTaxTotal()));
                v.setCount(v.getCount() + 1);
                return v;
            });
        }

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTax(totalTax)
                .totalPaid(totalPaid)
                .totalDue(totalDue)
                .invoiceCount(invoices.size())
                .periods(new ArrayList<>(periodMap.values()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<TopProductResponse> getTopProducts(UUID orgId, UUID shopId, LocalDate from, LocalDate to, int limit) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Invoice> invoices = invoiceRepository.findForReport(orgId, shopId, fromInstant, toInstant);

        Map<UUID, TopProductAccumulator> accMap = new LinkedHashMap<>();

        for (Invoice inv : invoices) {
            for (InvoiceLine line : inv.getLines()) {
                accMap.compute(line.getProduct().getId(), (k, v) -> {
                    if (v == null) {
                        return new TopProductAccumulator(
                                line.getProduct().getId(),
                                line.getProductName(),
                                line.getProduct().getSku(),
                                line.getQuantity(),
                                line.getLineTotal());
                    }
                    v.totalQuantity += line.getQuantity();
                    v.totalRevenue = v.totalRevenue.add(line.getLineTotal());
                    return v;
                });
            }
        }

        return accMap.values().stream()
                .sorted(Comparator.comparingLong(TopProductAccumulator::getTotalQuantity).reversed())
                .limit(limit)
                .map(a -> TopProductResponse.builder()
                        .productId(a.productId)
                        .productName(a.productName)
                        .sku(a.sku)
                        .totalQuantity(a.totalQuantity)
                        .totalRevenue(a.totalRevenue)
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MarginReportResponse> getMarginReport(UUID orgId, UUID shopId, LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Invoice> invoices = invoiceRepository.findForReport(orgId, shopId, fromInstant, toInstant);

        Map<UUID, MarginAccumulator> accMap = new LinkedHashMap<>();

        for (Invoice inv : invoices) {
            for (InvoiceLine line : inv.getLines()) {
                accMap.compute(line.getProduct().getId(), (k, v) -> {
                    if (v == null) {
                        return new MarginAccumulator(
                                line.getProduct().getId(),
                                line.getProductName(),
                                line.getProduct().getSku(),
                                line.getProduct().getBuyPrice(),
                                line.getUnitPrice(),
                                line.getQuantity());
                    }
                    v.totalSold += line.getQuantity();
                    return v;
                });
            }
        }

        return accMap.values().stream()
                .map(a -> {
                    BigDecimal marginPerUnit = a.sellPrice.subtract(a.buyPrice);
                    BigDecimal marginPercent = a.buyPrice.compareTo(BigDecimal.ZERO) > 0
                            ? marginPerUnit.multiply(BigDecimal.valueOf(100)).divide(a.buyPrice, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    BigDecimal totalMargin = marginPerUnit.multiply(BigDecimal.valueOf(a.totalSold));

                    return MarginReportResponse.builder()
                            .productId(a.productId)
                            .productName(a.productName)
                            .sku(a.sku)
                            .buyPrice(a.buyPrice)
                            .sellPrice(a.sellPrice)
                            .marginPerUnit(marginPerUnit)
                            .marginPercent(marginPercent)
                            .totalSold(a.totalSold)
                            .totalMargin(totalMargin)
                            .build();
                })
                .sorted(Comparator.comparing(MarginReportResponse::getTotalMargin).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public StockEvolutionResponse getStockEvolution(UUID shopId, LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<StockMovement> movements = stockMovementRepository.findByShopIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                shopId, fromInstant, toInstant);

        DateTimeFormatter dayFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, long[]> dayMap = new TreeMap<>();

        for (StockMovement m : movements) {
            String day = m.getCreatedAt().atOffset(ZoneOffset.UTC).format(dayFormat);
            long[] counts = dayMap.computeIfAbsent(day, k -> new long[2]);

            if (m.getType() == MovementType.ENTRY || m.getType() == MovementType.TRANSFER_IN) {
                counts[0] += m.getQuantity();
            } else if (m.getType() == MovementType.EXIT || m.getType() == MovementType.TRANSFER_OUT) {
                counts[1] += Math.abs(m.getQuantity());
            }
        }

        List<StockEvolutionResponse.StockPoint> points = dayMap.entrySet().stream()
                .map(e -> StockEvolutionResponse.StockPoint.builder()
                        .date(e.getKey())
                        .entries(e.getValue()[0])
                        .exits(e.getValue()[1])
                        .net(e.getValue()[0] - e.getValue()[1])
                        .build())
                .toList();

        return StockEvolutionResponse.builder().points(points).build();
    }

    private static class TopProductAccumulator {
        UUID productId;
        String productName;
        String sku;
        long totalQuantity;
        BigDecimal totalRevenue;

        TopProductAccumulator(UUID productId, String productName, String sku, long totalQuantity, BigDecimal totalRevenue) {
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.totalQuantity = totalQuantity;
            this.totalRevenue = totalRevenue;
        }

        long getTotalQuantity() { return totalQuantity; }
    }

    private static class MarginAccumulator {
        UUID productId;
        String productName;
        String sku;
        BigDecimal buyPrice;
        BigDecimal sellPrice;
        long totalSold;

        MarginAccumulator(UUID productId, String productName, String sku, BigDecimal buyPrice, BigDecimal sellPrice, long totalSold) {
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.buyPrice = buyPrice != null ? buyPrice : BigDecimal.ZERO;
            this.sellPrice = sellPrice;
            this.totalSold = totalSold;
        }
    }
}
