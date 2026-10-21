package com.kassa.api.service;

import com.kassa.api.dto.product.ProductRequest;
import com.kassa.api.dto.product.ProductResponse;
import com.kassa.api.entity.Category;
import com.kassa.api.entity.Organization;
import com.kassa.api.entity.Product;
import com.kassa.api.entity.Supplier;
import com.kassa.api.exception.BusinessException;
import com.kassa.api.exception.ResourceNotFoundException;
import com.kassa.api.repository.CategoryRepository;
import com.kassa.api.repository.OrganizationRepository;
import com.kassa.api.repository.ProductRepository;
import com.kassa.api.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllByOrganization(UUID organizationId, Pageable pageable) {
        return productRepository.findByOrganizationId(organizationId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id, UUID organizationId) {
        Product product = productRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id.toString()));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(UUID organizationId, String name, String sku,
                                         UUID categoryId, Boolean active, Pageable pageable) {
        return productRepository.search(organizationId, name, sku, categoryId, active, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ProductResponse create(ProductRequest request, UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        if (productRepository.existsByOrganizationIdAndSku(organizationId, request.getSku())) {
            throw new BusinessException("A product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = Product.builder()
                .sku(request.getSku())
                .barcode(request.getBarcode())
                .name(request.getName())
                .description(request.getDescription())
                .unit(request.getUnit())
                .buyPrice(request.getBuyPrice())
                .sellPrice(request.getSellPrice())
                .tvaRate(request.getTvaRate() != null ? request.getTvaRate() : BigDecimal.ZERO)
                .alertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 5)
                .photoUrl(request.getPhotoUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .organization(org)
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndOrganizationId(request.getCategoryId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId().toString()));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findByIdAndOrganizationId(request.getSupplierId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.getSupplierId().toString()));
            product.setSupplier(supplier);
        }

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request, UUID organizationId) {
        Product product = productRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id.toString()));

        // Check SKU uniqueness if changed
        if (!product.getSku().equals(request.getSku()) &&
                productRepository.existsByOrganizationIdAndSku(organizationId, request.getSku())) {
            throw new BusinessException("A product with SKU '" + request.getSku() + "' already exists");
        }

        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnit(request.getUnit());
        product.setBuyPrice(request.getBuyPrice());
        product.setSellPrice(request.getSellPrice());

        if (request.getTvaRate() != null) {
            product.setTvaRate(request.getTvaRate());
        }
        if (request.getAlertThreshold() != null) {
            product.setAlertThreshold(request.getAlertThreshold());
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        product.setPhotoUrl(request.getPhotoUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndOrganizationId(request.getCategoryId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId().toString()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findByIdAndOrganizationId(request.getSupplierId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.getSupplierId().toString()));
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public void delete(UUID id, UUID organizationId) {
        Product product = productRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id.toString()));
        productRepository.delete(product);
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .unit(product.getUnit())
                .buyPrice(product.getBuyPrice())
                .sellPrice(product.getSellPrice())
                .tvaRate(product.getTvaRate())
                .alertThreshold(product.getAlertThreshold())
                .photoUrl(product.getPhotoUrl())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
