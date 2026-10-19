package com.kassa.api.repository;

import com.kassa.api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByOrganizationIdOrderByNameAsc(UUID organizationId);

    List<Category> findByOrganizationIdAndParentIsNullOrderByNameAsc(UUID organizationId);

    List<Category> findByParentId(UUID parentId);

    Optional<Category> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
