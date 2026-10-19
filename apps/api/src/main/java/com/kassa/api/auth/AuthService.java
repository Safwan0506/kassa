package com.kassa.api.auth;

import com.kassa.api.audit.AuditService;
import com.kassa.api.auth.dto.AuthResponse;
import com.kassa.api.auth.dto.UserInfo;
import com.kassa.api.entity.AppUser;
import com.kassa.api.entity.RefreshToken;
import com.kassa.api.entity.UserShop;
import com.kassa.api.repository.AppUserRepository;
import com.kassa.api.repository.RefreshTokenRepository;
import com.kassa.api.repository.UserShopRepository;
import com.kassa.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    private final AppUserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserShopRepository userShopRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public AuthResult login(String email, String password, String ipAddress) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!user.isActive()) {
            throw new AuthException("Account is deactivated");
        }

        if (user.isLocked()) {
            auditService.log(user.getId(), "LOGIN_LOCKED", "AppUser",
                    user.getId(), "Account locked due to too many failed attempts", ipAddress);
            throw new AuthException("Account is locked. Try again later.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            handleFailedAttempt(user, ipAddress);
            throw new AuthException("Invalid email or password");
        }

        // Successful login — reset failed attempts
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getOrganization().getId());

        RefreshToken refreshToken = createRefreshToken(user);

        UserInfo userInfo = buildUserInfo(user);

        auditService.log(user.getId(), "LOGIN_SUCCESS", "AppUser",
                user.getId(), null, ipAddress);

        AuthResponse response = AuthResponse.builder()
                .message("Login successful")
                .user(userInfo)
                .build();

        return new AuthResult(accessToken, refreshToken.getToken(), response);
    }

    @Transactional
    public AuthResult refresh(String refreshTokenValue, String ipAddress) {
        RefreshToken existing = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (!existing.isUsable()) {
            throw new AuthException("Refresh token expired or revoked");
        }

        // Revoke the old token (rotation)
        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        AppUser user = existing.getUser();

        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getOrganization().getId());

        RefreshToken newRefreshToken = createRefreshToken(user);

        UserInfo userInfo = buildUserInfo(user);

        AuthResponse response = AuthResponse.builder()
                .message("Token refreshed")
                .user(userInfo)
                .build();

        return new AuthResult(accessToken, newRefreshToken.getToken(), response);
    }

    @Transactional
    public void logout(String refreshTokenValue, UUID userId, String ipAddress) {
        if (refreshTokenValue != null) {
            refreshTokenRepository.findByToken(refreshTokenValue)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }

        auditService.log(userId, "LOGOUT", "AppUser", userId, null, ipAddress);
    }

    @Transactional(readOnly = true)
    public UserInfo getCurrentUser(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));
        return buildUserInfo(user);
    }

    private void handleFailedAttempt(AppUser user, String ipAddress) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCKOUT_DURATION));
            auditService.log(user.getId(), "ACCOUNT_LOCKED", "AppUser",
                    user.getId(), "Locked after " + attempts + " failed attempts", ipAddress);
        }

        userRepository.save(user);

        auditService.log(user.getId(), "LOGIN_FAILED", "AppUser",
                user.getId(), "Failed attempt #" + attempts, ipAddress);
    }

    private RefreshToken createRefreshToken(AppUser user) {
        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(Instant.now().plus(REFRESH_TOKEN_TTL))
                .build();
        return refreshTokenRepository.save(token);
    }

    private UserInfo buildUserInfo(AppUser user) {
        List<UserShop> userShops = userShopRepository.findByUserId(user.getId());

        List<UserInfo.ShopRoleInfo> shopRoles = userShops.stream()
                .map(us -> UserInfo.ShopRoleInfo.builder()
                        .shopId(us.getShop().getId())
                        .shopName(us.getShop().getName())
                        .role(us.getRole().name())
                        .build())
                .toList();

        return UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .organizationId(user.getOrganization().getId())
                .organizationName(user.getOrganization().getName())
                .shops(shopRoles)
                .build();
    }

    public record AuthResult(String accessToken, String refreshToken, AuthResponse response) {}
}
