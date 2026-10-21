package com.kassa.api.controller;

import com.kassa.api.dto.dashboard.DashboardStatsResponse;
import com.kassa.api.dto.dashboard.StockAlertResponse;
import com.kassa.api.dto.stock.StockMovementResponse;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityHelper securityHelper;

    @GetMapping("/stats/{shopId}")
    public ResponseEntity<DashboardStatsResponse> getStats(@PathVariable UUID shopId,
                                                            Authentication authentication) {
        securityHelper.requireRoleForShop(authentication, shopId,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER, ShopRole.MAGASINIER);
        return ResponseEntity.ok(dashboardService.getStats(shopId));
    }

    @GetMapping("/alerts/{shopId}")
    public ResponseEntity<List<StockAlertResponse>> getAlerts(@PathVariable UUID shopId,
                                                               Authentication authentication) {
        securityHelper.requireRoleForShop(authentication, shopId,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER, ShopRole.MAGASINIER);
        return ResponseEntity.ok(dashboardService.getAlerts(shopId));
    }

    @GetMapping("/recent-movements/{shopId}")
    public ResponseEntity<List<StockMovementResponse>> getRecentMovements(@PathVariable UUID shopId,
                                                                           Authentication authentication) {
        securityHelper.requireRoleForShop(authentication, shopId,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER, ShopRole.MAGASINIER);
        return ResponseEntity.ok(dashboardService.getRecentMovements(shopId));
    }
}
