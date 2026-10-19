package com.kassa.api.service;

import com.kassa.api.dto.stock.StockLevelResponse;
import com.kassa.api.dto.stock.StockMovementResponse;
import com.kassa.api.entity.*;
import com.kassa.api.exception.BusinessException;
import com.kassa.api.exception.InsufficientStockException;
import com.kassa.api.exception.ResourceNotFoundException;
import com.kassa.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<StockLevelResponse> getStockLevels(UUID shopId) {
        return stockLevelRepository.findByShopId(shopId)
                .stream()
                .map(this::toStockLevelResponse)
                .toList();
    }

    @Transactional
    public StockMovementResponse addEntry(UUID shopId, UUID productId, int qty, String reason, UUID userId) {
        if (qty <= 0) {
            throw new BusinessException("Quantity must be positive");
        }

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId.toString()));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        StockLevel stockLevel = getOrCreateStockLevel(shop, product);
        stockLevel.setQuantity(stockLevel.getQuantity() + qty);
        stockLevelRepository.save(stockLevel);

        StockMovement movement = StockMovement.builder()
                .shop(shop)
                .product(product)
                .type(MovementType.ENTRY)
                .quantity(qty)
                .reason(reason)
                .createdBy(userId)
                .build();
        movement = stockMovementRepository.save(movement);

        return toMovementResponse(movement);
    }

    @Transactional
    public StockMovementResponse removeStock(UUID shopId, UUID productId, int qty, String reason, UUID userId) {
        if (qty <= 0) {
            throw new BusinessException("Quantity must be positive");
        }

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId.toString()));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        StockLevel stockLevel = stockLevelRepository.findByShopIdAndProductId(shopId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock level", shopId + "/" + productId));

        int newQty = stockLevel.getQuantity() - qty;
        if (newQty < 0) {
            throw new InsufficientStockException(stockLevel.getQuantity(), qty);
        }

        stockLevel.setQuantity(newQty);
        stockLevelRepository.save(stockLevel);

        StockMovement movement = StockMovement.builder()
                .shop(shop)
                .product(product)
                .type(MovementType.EXIT)
                .quantity(qty)
                .reason(reason)
                .createdBy(userId)
                .build();
        movement = stockMovementRepository.save(movement);

        return toMovementResponse(movement);
    }

    @Transactional
    public void transferStock(UUID fromShopId, UUID toShopId, UUID productId, int qty, String reason, UUID userId) {
        if (qty <= 0) {
            throw new BusinessException("Quantity must be positive");
        }

        if (fromShopId.equals(toShopId)) {
            throw new BusinessException("Source and destination shops must be different");
        }

        Shop fromShop = shopRepository.findById(fromShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", fromShopId.toString()));
        Shop toShop = shopRepository.findById(toShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", toShopId.toString()));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        // Decrement source
        StockLevel fromLevel = stockLevelRepository.findByShopIdAndProductId(fromShopId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock level", fromShopId + "/" + productId));

        int newFromQty = fromLevel.getQuantity() - qty;
        if (newFromQty < 0) {
            throw new InsufficientStockException(fromLevel.getQuantity(), qty);
        }
        fromLevel.setQuantity(newFromQty);
        stockLevelRepository.save(fromLevel);

        // Increment destination
        StockLevel toLevel = getOrCreateStockLevel(toShop, product);
        toLevel.setQuantity(toLevel.getQuantity() + qty);
        stockLevelRepository.save(toLevel);

        // Create linked movements with a shared reference ID
        UUID referenceId = UUID.randomUUID();

        StockMovement outMovement = StockMovement.builder()
                .shop(fromShop)
                .product(product)
                .type(MovementType.TRANSFER_OUT)
                .quantity(qty)
                .reason(reason)
                .referenceId(referenceId)
                .createdBy(userId)
                .build();
        stockMovementRepository.save(outMovement);

        StockMovement inMovement = StockMovement.builder()
                .shop(toShop)
                .product(product)
                .type(MovementType.TRANSFER_IN)
                .quantity(qty)
                .reason(reason)
                .referenceId(referenceId)
                .createdBy(userId)
                .build();
        stockMovementRepository.save(inMovement);
    }

    @Transactional
    public StockMovementResponse adjustStock(UUID shopId, UUID productId, int newQty, String reason, UUID userId) {
        if (newQty < 0) {
            throw new BusinessException("Stock quantity cannot be negative");
        }

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId.toString()));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        StockLevel stockLevel = getOrCreateStockLevel(shop, product);
        int oldQty = stockLevel.getQuantity();
        int diff = newQty - oldQty;

        stockLevel.setQuantity(newQty);
        stockLevelRepository.save(stockLevel);

        StockMovement movement = StockMovement.builder()
                .shop(shop)
                .product(product)
                .type(MovementType.ADJUSTMENT)
                .quantity(diff)
                .reason(reason != null ? reason : "Adjustment from " + oldQty + " to " + newQty)
                .createdBy(userId)
                .build();
        movement = stockMovementRepository.save(movement);

        return toMovementResponse(movement);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getMovements(UUID shopId, UUID productId, MovementType type, Pageable pageable) {
        return stockMovementRepository.findFiltered(shopId, productId, type, pageable)
                .map(this::toMovementResponse);
    }

    private StockLevel getOrCreateStockLevel(Shop shop, Product product) {
        return stockLevelRepository.findByShopIdAndProductId(shop.getId(), product.getId())
                .orElseGet(() -> {
                    StockLevel sl = StockLevel.builder()
                            .shop(shop)
                            .product(product)
                            .quantity(0)
                            .build();
                    return stockLevelRepository.save(sl);
                });
    }

    private StockLevelResponse toStockLevelResponse(StockLevel sl) {
        Product p = sl.getProduct();
        return StockLevelResponse.builder()
                .id(sl.getId())
                .shopId(sl.getShop().getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSku(p.getSku())
                .sellPrice(p.getSellPrice())
                .quantity(sl.getQuantity())
                .alertThreshold(p.getAlertThreshold())
                .belowAlert(sl.getQuantity() < p.getAlertThreshold())
                .build();
    }

    private StockMovementResponse toMovementResponse(StockMovement m) {
        return StockMovementResponse.builder()
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
                .createdAt(m.getCreatedAt())
                .build();
    }
}
