package com.kassa.api.repository;

import com.kassa.api.entity.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, UUID> {

    List<StockLevel> findByShopId(UUID shopId);

    Optional<StockLevel> findByShopIdAndProductId(UUID shopId, UUID productId);
}
