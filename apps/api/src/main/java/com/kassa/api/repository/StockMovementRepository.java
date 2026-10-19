package com.kassa.api.repository;

import com.kassa.api.entity.StockMovement;
import com.kassa.api.entity.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    Page<StockMovement> findByShopIdAndProductIdOrderByCreatedAtDesc(UUID shopId, UUID productId, Pageable pageable);

    Page<StockMovement> findByShopIdOrderByCreatedAtDesc(UUID shopId, Pageable pageable);

    @Query("SELECT m FROM StockMovement m WHERE m.shop.id = :shopId " +
           "AND (:productId IS NULL OR m.product.id = :productId) " +
           "AND (:type IS NULL OR m.type = :type) " +
           "ORDER BY m.createdAt DESC")
    Page<StockMovement> findFiltered(@Param("shopId") UUID shopId,
                                     @Param("productId") UUID productId,
                                     @Param("type") MovementType type,
                                     Pageable pageable);
}
