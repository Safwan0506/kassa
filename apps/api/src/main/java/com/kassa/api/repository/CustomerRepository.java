package com.kassa.api.repository;

import com.kassa.api.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    List<Customer> findByOrganizationIdOrderByNameAsc(UUID organizationId);

    Optional<Customer> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
