package com.kassa.api.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfo {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private UUID organizationId;
    private String organizationName;
    private List<ShopRoleInfo> shops;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShopRoleInfo {
        private UUID shopId;
        private String shopName;
        private String role;
    }
}
