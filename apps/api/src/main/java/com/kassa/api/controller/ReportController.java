package com.kassa.api.controller;

import com.kassa.api.dto.report.*;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final SecurityHelper securityHelper;

    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportResponse> getRevenue(
            @RequestParam(required = false) UUID shopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication) {
        securityHelper.requireRole(authentication, ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(reportService.getRevenueReport(orgId, shopId, from, to));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductResponse>> getTopProducts(
            @RequestParam(required = false) UUID shopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        securityHelper.requireRole(authentication, ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(reportService.getTopProducts(orgId, shopId, from, to, limit));
    }

    @GetMapping("/margins")
    public ResponseEntity<List<MarginReportResponse>> getMargins(
            @RequestParam(required = false) UUID shopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication) {
        securityHelper.requireRole(authentication, ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(reportService.getMarginReport(orgId, shopId, from, to));
    }

    @GetMapping("/stock-evolution")
    public ResponseEntity<StockEvolutionResponse> getStockEvolution(
            @RequestParam UUID shopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication) {
        securityHelper.requireRole(authentication, ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        return ResponseEntity.ok(reportService.getStockEvolution(shopId, from, to));
    }
}
