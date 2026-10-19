package com.kassa.api.security;

import com.kassa.api.entity.ShopRole;
import com.kassa.api.entity.UserShop;
import com.kassa.api.exception.BusinessException;
import com.kassa.api.repository.AppUserRepository;
import com.kassa.api.repository.UserShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Extracts current user info from the security context and enforces role checks.
 */
@Component
@RequiredArgsConstructor
public class SecurityHelper {

    private final AppUserRepository appUserRepository;
    private final UserShopRepository userShopRepository;

    public UUID getCurrentUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    public UUID getCurrentOrganizationId(Authentication authentication) {
        UUID userId = getCurrentUserId(authentication);
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.UNAUTHORIZED))
                .getOrganization().getId();
    }

    /**
     * Check that the current user has at least one of the given roles in any of their shops.
     */
    public void requireRole(Authentication authentication, ShopRole... roles) {
        UUID userId = getCurrentUserId(authentication);
        List<UserShop> userShops = userShopRepository.findByUserId(userId);
        List<ShopRole> allowedRoles = List.of(roles);

        boolean hasRole = userShops.stream()
                .anyMatch(us -> allowedRoles.contains(us.getRole()));

        if (!hasRole) {
            throw new BusinessException("Insufficient permissions", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * Check that the current user has at least one of the given roles for a specific shop.
     */
    public void requireRoleForShop(Authentication authentication, UUID shopId, ShopRole... roles) {
        UUID userId = getCurrentUserId(authentication);
        List<UserShop> userShops = userShopRepository.findByUserId(userId);
        List<ShopRole> allowedRoles = List.of(roles);

        boolean hasRole = userShops.stream()
                .filter(us -> us.getShop().getId().equals(shopId))
                .anyMatch(us -> allowedRoles.contains(us.getRole()));

        if (!hasRole) {
            throw new BusinessException("Insufficient permissions for this shop", HttpStatus.FORBIDDEN);
        }
    }
}
