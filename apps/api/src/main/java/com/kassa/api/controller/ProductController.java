package com.kassa.api.controller;

import com.kassa.api.dto.PaginatedResponse;
import com.kassa.api.dto.product.ProductRequest;
import com.kassa.api.dto.product.ProductResponse;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final SecurityHelper securityHelper;

    @GetMapping
    public ResponseEntity<PaginatedResponse<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, limit);
        return ResponseEntity.ok(PaginatedResponse.from(
                productService.getAllByOrganization(orgId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable UUID id,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(productService.getById(id, orgId));
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<ProductResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) UUID category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, limit);
        return ResponseEntity.ok(PaginatedResponse.from(
                productService.search(orgId, q, sku, category, active, pageable)));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request,
                                                   Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        ProductResponse response = productService.create(request, orgId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody ProductRequest request,
                                                   Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(productService.update(id, request, orgId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                        Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        productService.delete(id, orgId);
        return ResponseEntity.noContent().build();
    }
}
