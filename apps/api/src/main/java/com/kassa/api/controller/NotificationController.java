package com.kassa.api.controller;

import com.kassa.api.dto.PaginatedResponse;
import com.kassa.api.dto.notification.NotificationCountResponse;
import com.kassa.api.dto.notification.NotificationResponse;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityHelper securityHelper;

    @GetMapping
    public ResponseEntity<PaginatedResponse<NotificationResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        UUID userId = securityHelper.getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, limit);
        return ResponseEntity.ok(PaginatedResponse.from(
                notificationService.getForUser(orgId, userId, pageable)));
    }

    @GetMapping("/count")
    public ResponseEntity<NotificationCountResponse> count(Authentication authentication) {
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        UUID userId = securityHelper.getCurrentUserId(authentication);
        long unread = notificationService.countUnread(orgId, userId);
        return ResponseEntity.ok(NotificationCountResponse.builder().unreadCount(unread).build());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable UUID id) {
        notificationService.markRead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        UUID userId = securityHelper.getCurrentUserId(authentication);
        notificationService.markAllRead(orgId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-alerts")
    public ResponseEntity<Void> generateAlerts(Authentication authentication) {
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        notificationService.generateStockAlerts(orgId);
        return ResponseEntity.noContent().build();
    }
}
