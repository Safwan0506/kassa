package com.kassa.api.controller;

import com.kassa.api.dto.customer.CustomerRequest;
import com.kassa.api.dto.customer.CustomerResponse;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final SecurityHelper securityHelper;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAll(Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(customerService.getAllByOrganization(orgId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable UUID id,
                                                     Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(customerService.getById(id, orgId));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request, orgId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(@PathVariable UUID id,
                                                    @Valid @RequestBody CustomerRequest request,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(customerService.update(id, request, orgId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                        Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        customerService.delete(id, orgId);
        return ResponseEntity.noContent().build();
    }
}
