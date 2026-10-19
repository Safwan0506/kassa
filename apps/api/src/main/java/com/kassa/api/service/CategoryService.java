package com.kassa.api.service;

import com.kassa.api.dto.category.CategoryRequest;
import com.kassa.api.dto.category.CategoryResponse;
import com.kassa.api.entity.Category;
import com.kassa.api.entity.Organization;
import com.kassa.api.exception.ResourceNotFoundException;
import com.kassa.api.repository.CategoryRepository;
import com.kassa.api.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllByOrganization(UUID organizationId) {
        return categoryRepository.findByOrganizationIdOrderByNameAsc(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(UUID id, UUID organizationId) {
        Category category = categoryRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id.toString()));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request, UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        Category category = Category.builder()
                .name(request.getName())
                .organization(org)
                .build();

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findByIdAndOrganizationId(request.getParentId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category", request.getParentId().toString()));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request, UUID organizationId) {
        Category category = categoryRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id.toString()));

        category.setName(request.getName());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findByIdAndOrganizationId(request.getParentId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category", request.getParentId().toString()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public void delete(UUID id, UUID organizationId) {
        Category category = categoryRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id.toString()));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .createdAt(category.getCreatedAt())
                .build();
    }
}
