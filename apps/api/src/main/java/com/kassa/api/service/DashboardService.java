package com.kassa.api.service;

import com.kassa.api.dto.dashboard.DashboardStatsResponse;
import com.kassa.api.dto.dashboard.StockAlertResponse;
import com.kassa.api.dto.stock.StockMovementResponse;
import com.kassa.api.entity.AppUser;
import com.kassa.api.entity.StockLevel;
import com.kassa.api.repository.AppUserRepository;
import com.kassa.api.repository.StockLevelRepository;
import com.kassa.api.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(UUID shopId) {
        List<StockLevel> levels = stockLevelRepository.findByShopId(shopId);

        long totalProducts = levels.size();
        long outOfStock = levels.stream().filter(sl -> sl.getQuantity() == 0).count();

        BigDecimal stockValue = levels.stream()
                .map(sl -> sl.getProduct().getSellPrice()
                        .multiply(BigDecimal.valueOf(sl.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        long todayMovements = stockMovementRepository.countByShopIdAndCreatedAtAfter(shopId, startOfDay);

        return DashboardStatsResponse.builder()
                .totalProducts(totalProducts)
                .outOfStock(outOfStock)
                .stockValue(stockValue)
                .todayMovements(todayMovements)
                .build();
    }

    @Transactional(readOnly = true)
    public List<StockAlertResponse> getAlerts(UUID shopId) {
        return stockLevelRepository.findBelowAlert(shopId)
                .stream()
                .map(sl -> StockAlertResponse.builder()
                        .productId(sl.getProduct().getId())
                        .productName(sl.getProduct().getName())
                        .sku(sl.getProduct().getSku())
                        .currentStock(sl.getQuantity())
                        .alertThreshold(sl.getProduct().getAlertThreshold())
                        .shopId(sl.getShop().getId())
                        .shopName(sl.getShop().getName())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> getRecentMovements(UUID shopId) {
        var movements = stockMovementRepository.findTop10ByShopIdOrderByCreatedAtDesc(shopId);

        // Get all user IDs
        var userIds = movements.stream()
                .map(m -> m.getCreatedBy())
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        // Fetch users in one query
        Map<UUID, String> userNames = appUserRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(
                        AppUser::getId,
                        u -> u.getFirstName() + " " + u.getLastName()
                ));

        return movements.stream()
                .map(m -> StockMovementResponse.builder()
                        .id(m.getId())
                        .shopId(m.getShop().getId())
                        .shopName(m.getShop().getName())
                        .productId(m.getProduct().getId())
                        .productName(m.getProduct().getName())
                        .type(m.getType().name())
                        .quantity(m.getQuantity())
                        .reason(m.getReason())
                        .referenceId(m.getReferenceId())
                        .createdBy(m.getCreatedBy())
                        .userName(m.getCreatedBy() != null ? userNames.getOrDefault(m.getCreatedBy(), "Inconnu") : "Système")
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();
    }
}
