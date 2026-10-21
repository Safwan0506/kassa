package com.kassa.api.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private UUID id;
    private String type;
    private String title;
    private String message;
    private String entityType;
    private UUID entityId;
    private boolean read;
    private Instant createdAt;
}
