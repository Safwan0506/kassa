package com.kassa.api.repository;

import com.kassa.api.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByOrganizationId(UUID organizationId, Pageable pageable);

    Optional<Product> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndSku(UUID organizationId, String sku);

    @Query("SELECT p FROM Product p WHERE p.organization.id = :orgId " +
           "AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:sku IS NULL OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :sku, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:active IS NULL OR p.active = :active)")
    Page<Product> search(@Param("orgId") UUID orgId,
                         @Param("name") String name,
                         @Param("sku") String sku,
                         @Param("categoryId") UUID categoryId,
                         @Param("active") Boolean active,
                         Pageable pageable);
}
