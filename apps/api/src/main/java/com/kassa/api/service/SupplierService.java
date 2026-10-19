package com.kassa.api.service;

import com.kassa.api.dto.supplier.SupplierRequest;
import com.kassa.api.dto.supplier.SupplierResponse;
import com.kassa.api.entity.Organization;
import com.kassa.api.entity.Supplier;
import com.kassa.api.exception.ResourceNotFoundException;
import com.kassa.api.repository.OrganizationRepository;
import com.kassa.api.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllByOrganization(UUID organizationId) {
        return supplierRepository.findByOrganizationIdOrderByNameAsc(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse getById(UUID id, UUID organizationId) {
        Supplier supplier = supplierRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id.toString()));
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse create(SupplierRequest request, UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .organization(org)
                .build();

        supplier = supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse update(UUID id, SupplierRequest request, UUID organizationId) {
        Supplier supplier = supplierRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id.toString()));

        supplier.setName(request.getName());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());

        supplier = supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    @Transactional
    public void delete(UUID id, UUID organizationId) {
        Supplier supplier = supplierRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id.toString()));
        supplierRepository.delete(supplier);
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}
