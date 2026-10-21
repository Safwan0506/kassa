package com.kassa.api.repository;

import com.kassa.api.entity.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, UUID> {

    List<StockLevel> findByShopId(UUID shopId);

    Optional<StockLevel> findByShopIdAndProductId(UUID shopId, UUID productId);

    long countByShopIdAndQuantity(UUID shopId, int quantity);

    @Query("SELECT sl FROM StockLevel sl JOIN FETCH sl.product p " +
           "WHERE sl.shop.id = :shopId AND sl.quantity <= p.alertThreshold")
    List<StockLevel> findBelowAlert(@Param("shopId") UUID shopId);
}
