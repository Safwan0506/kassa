package com.kassa.api.config;

import com.kassa.api.repository.OrganizationRepository;
import com.kassa.api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StockAlertScheduler {

    private final OrganizationRepository organizationRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 3600000)
    public void checkStockAlerts() {
        log.info("Running scheduled stock alert check");
        organizationRepository.findAll().forEach(org -> {
            try {
                notificationService.generateStockAlerts(org.getId());
            } catch (Exception e) {
                log.error("Failed to generate stock alerts for org {}: {}", org.getId(), e.getMessage());
            }
        });
    }
}
