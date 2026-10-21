package com.kassa.api.service;

import com.kassa.api.dto.notification.NotificationResponse;
import com.kassa.api.entity.*;
import com.kassa.api.repository.NotificationRepository;
import com.kassa.api.repository.StockLevelRepository;
import com.kassa.api.repository.InvoiceRepository;
import com.kassa.api.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StockLevelRepository stockLevelRepository;
    private final InvoiceRepository invoiceRepository;
    private final ShopRepository shopRepository;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getForUser(UUID orgId, UUID userId, Pageable pageable) {
        return notificationRepository.findForUser(orgId, userId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long countUnread(UUID orgId, UUID userId) {
        return notificationRepository.countUnread(orgId, userId);
    }

    @Transactional
    public void markRead(UUID id) {
        notificationRepository.markRead(id);
    }

    @Transactional
    public void markAllRead(UUID orgId, UUID userId) {
        notificationRepository.markAllRead(orgId, userId);
    }

    @Transactional
    public void generateStockAlerts(UUID organizationId) {
        List<Shop> shops = shopRepository.findByOrganizationId(organizationId);
        Instant oneDayAgo = Instant.now().minus(24, ChronoUnit.HOURS);

        for (Shop shop : shops) {
            List<StockLevel> alerts = stockLevelRepository.findBelowAlert(shop.getId());

            for (StockLevel sl : alerts) {
                Product p = sl.getProduct();
                NotificationType type = sl.getQuantity() == 0
                        ? NotificationType.STOCK_OUT
                        : NotificationType.STOCK_ALERT;

                boolean alreadyNotified = notificationRepository
                        .existsByOrganizationIdAndTypeAndEntityIdAndCreatedAtAfter(
                                organizationId, type, p.getId(), oneDayAgo);

                if (alreadyNotified) continue;

                String title = sl.getQuantity() == 0
                        ? "Rupture de stock : " + p.getName()
                        : "Stock faible : " + p.getName();

                String message = sl.getQuantity() == 0
                        ? p.getName() + " est en rupture de stock dans " + shop.getName() + "."
                        : p.getName() + " n'a plus que " + sl.getQuantity() + " unites dans "
                          + shop.getName() + " (seuil : " + p.getAlertThreshold() + ").";

                Notification notification = Notification.builder()
                        .organization(shop.getOrganization())
                        .shopId(shop.getId())
                        .type(type)
                        .title(title)
                        .message(message)
                        .entityType("product")
                        .entityId(p.getId())
                        .build();

                notificationRepository.save(notification);
            }
        }
    }

    @Transactional
    public void createInvoiceNotification(Invoice invoice, NotificationType type) {
        String title;
        String message;

        switch (type) {
            case INVOICE_PAID -> {
                title = "Facture payee : " + invoice.getInvoiceNumber();
                message = "La facture " + invoice.getInvoiceNumber() + " a ete entierement payee ("
                          + invoice.getTotal() + " FCFA).";
            }
            case INVOICE_OVERDUE -> {
                title = "Facture impayee : " + invoice.getInvoiceNumber();
                message = "La facture " + invoice.getInvoiceNumber() + " est en attente de paiement. "
                          + "Reste du : " + invoice.getAmountDue() + " FCFA.";
            }
            default -> {
                return;
            }
        }

        Notification notification = Notification.builder()
                .organization(invoice.getOrganization())
                .shopId(invoice.getShop().getId())
                .type(type)
                .title(title)
                .message(message)
                .entityType("invoice")
                .entityId(invoice.getId())
                .build();

        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .message(n.getMessage())
                .entityType(n.getEntityType())
                .entityId(n.getEntityId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
