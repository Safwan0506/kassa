package com.kassa.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${kassa.rate-limit.requests-per-minute:60}")
    private int maxRequestsPerMinute;

    @Value("${kassa.rate-limit.login-requests-per-minute:10}")
    private int maxLoginRequestsPerMinute;

    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String ip = getClientIp(request);
        String path = request.getRequestURI();

        boolean isLogin = path.contains("/api/auth/login");
        int limit = isLogin ? maxLoginRequestsPerMinute : maxRequestsPerMinute;
        String key = isLogin ? "login:" + ip : ip;

        TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(limit));

        if (!bucket.tryConsume()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Trop de requetes. Reessayez dans un instant.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    static class TokenBucket {
        private final int maxTokens;
        private final AtomicLong tokens;
        private volatile long lastRefill;

        TokenBucket(int maxTokens) {
            this.maxTokens = maxTokens;
            this.tokens = new AtomicLong(maxTokens);
            this.lastRefill = System.currentTimeMillis();
        }

        boolean tryConsume() {
            refill();
            return tokens.getAndUpdate(t -> t > 0 ? t - 1 : 0) > 0;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long elapsed = now - lastRefill;
            if (elapsed >= 60_000) {
                tokens.set(maxTokens);
                lastRefill = now;
            }
        }
    }
}
