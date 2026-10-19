package com.kassa.api.controller;

import com.kassa.api.dto.category.CategoryRequest;
import com.kassa.api.dto.category.CategoryResponse;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final SecurityHelper securityHelper;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(categoryService.getAllByOrganization(orgId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable UUID id,
                                                     Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(categoryService.getById(id, orgId));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        CategoryResponse response = categoryService.create(request, orgId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable UUID id,
                                                    @Valid @RequestBody CategoryRequest request,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(categoryService.update(id, request, orgId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                        Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        categoryService.delete(id, orgId);
        return ResponseEntity.noContent().build();
    }
}
