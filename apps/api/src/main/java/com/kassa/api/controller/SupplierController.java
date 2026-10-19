package com.kassa.api.controller;

import com.kassa.api.dto.supplier.SupplierRequest;
import com.kassa.api.dto.supplier.SupplierResponse;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final SecurityHelper securityHelper;

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAll(Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(supplierService.getAllByOrganization(orgId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getById(@PathVariable UUID id,
                                                     Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(supplierService.getById(id, orgId));
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody SupplierRequest request,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        SupplierResponse response = supplierService.create(request, orgId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> update(@PathVariable UUID id,
                                                    @Valid @RequestBody SupplierRequest request,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(supplierService.update(id, request, orgId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                        Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.MAGASINIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        supplierService.delete(id, orgId);
        return ResponseEntity.noContent().build();
    }
}
