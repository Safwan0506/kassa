package com.kassa.api.repository;

import com.kassa.api.entity.Notification;
import com.kassa.api.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query("SELECT n FROM Notification n WHERE n.organization.id = :orgId " +
           "AND (n.userId IS NULL OR n.userId = :userId) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findForUser(@Param("orgId") UUID orgId,
                                    @Param("userId") UUID userId,
                                    Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.organization.id = :orgId " +
           "AND (n.userId IS NULL OR n.userId = :userId) " +
           "AND n.read = false")
    long countUnread(@Param("orgId") UUID orgId, @Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.organization.id = :orgId " +
           "AND (n.userId IS NULL OR n.userId = :userId) " +
           "AND n.read = false")
    int markAllRead(@Param("orgId") UUID orgId, @Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id")
    int markRead(@Param("id") UUID id);

    boolean existsByOrganizationIdAndTypeAndEntityIdAndCreatedAtAfter(
            UUID organizationId, NotificationType type, UUID entityId, Instant after);
}
