package com.kassa.api.repository;

import com.kassa.api.entity.Invoice;
import com.kassa.api.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByIdAndOrganizationId(UUID id, UUID organizationId);

    @Query("SELECT i FROM Invoice i WHERE i.organization.id = :orgId " +
           "AND (:shopId IS NULL OR i.shop.id = :shopId) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "ORDER BY i.createdAt DESC")
    Page<Invoice> findFiltered(@Param("orgId") UUID orgId,
                                @Param("shopId") UUID shopId,
                                @Param("status") InvoiceStatus status,
                                Pageable pageable);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.organization.id = :orgId " +
           "AND i.invoiceNumber LIKE :prefix%")
    long countByPrefix(@Param("orgId") UUID orgId, @Param("prefix") String prefix);

    @Query("SELECT i FROM Invoice i WHERE i.organization.id = :orgId " +
           "AND (:shopId IS NULL OR i.shop.id = :shopId) " +
           "AND i.status NOT IN (com.kassa.api.entity.InvoiceStatus.DRAFT, com.kassa.api.entity.InvoiceStatus.CANCELLED) " +
           "AND i.createdAt >= :from AND i.createdAt < :to " +
           "ORDER BY i.createdAt ASC")
    List<Invoice> findForReport(@Param("orgId") UUID orgId,
                                 @Param("shopId") UUID shopId,
                                 @Param("from") Instant from,
                                 @Param("to") Instant to);

    @Query("SELECT i FROM Invoice i " +
           "LEFT JOIN FETCH i.lines l " +
           "LEFT JOIN FETCH l.product " +
           "LEFT JOIN FETCH i.payments " +
           "LEFT JOIN FETCH i.customer " +
           "LEFT JOIN FETCH i.shop " +
           "LEFT JOIN FETCH i.organization " +
           "WHERE i.id = :id AND i.organization.id = :orgId")
    Optional<Invoice> findByIdWithDetails(@Param("id") UUID id, @Param("orgId") UUID orgId);
}
