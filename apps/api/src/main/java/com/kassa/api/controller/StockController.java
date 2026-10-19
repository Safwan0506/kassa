package com.kassa.api.controller;

import com.kassa.api.dto.stock.*;
import com.kassa.api.entity.MovementType;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.exception.BusinessException;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final SecurityHelper securityHelper;

    @GetMapping("/shops/{shopId}")
    public ResponseEntity<List<StockLevelResponse>> getStockLevels(@PathVariable UUID shopId,
                                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        return ResponseEntity.ok(stockService.getStockLevels(shopId));
    }

    @PostMapping("/movements")
    public ResponseEntity<StockMovementResponse> createMovement(
            @Valid @RequestBody StockMovementRequest request,
            Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID userId = securityHelper.getCurrentUserId(authentication);

        MovementType type;
        try {
            type = MovementType.valueOf(request.getType());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid movement type: " + request.getType());
        }

        StockMovementResponse response;
        switch (type) {
            case ENTRY -> response = stockService.addEntry(
                    request.getShopId(), request.getProductId(),
                    request.getQuantity(), request.getReason(), userId);
            case EXIT -> response = stockService.removeStock(
                    request.getShopId(), request.getProductId(),
                    request.getQuantity(), request.getReason(), userId);
            case ADJUSTMENT -> response = stockService.adjustStock(
                    request.getShopId(), request.getProductId(),
                    request.getQuantity(), request.getReason(), userId);
            default -> throw new BusinessException(
                    "Use /api/stock/transfers for transfer operations");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/transfers")
    public ResponseEntity<Void> transferStock(
            @Valid @RequestBody StockTransferRequest request,
            Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID userId = securityHelper.getCurrentUserId(authentication);

        stockService.transferStock(
                request.getFromShopId(), request.getToShopId(),
                request.getProductId(), request.getQuantity(),
                request.getReason(), userId);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/movements")
    public ResponseEntity<Page<StockMovementResponse>> getMovements(
            @RequestParam UUID shopId,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) String type,
            Authentication authentication,
            Pageable pageable) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);

        MovementType movementType = null;
        if (type != null && !type.isBlank()) {
            try {
                movementType = MovementType.valueOf(type);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid movement type: " + type);
            }
        }

        return ResponseEntity.ok(stockService.getMovements(shopId, productId, movementType, pageable));
    }
}
