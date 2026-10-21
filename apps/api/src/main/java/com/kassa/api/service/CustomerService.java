package com.kassa.api.service;

import com.kassa.api.dto.customer.CustomerRequest;
import com.kassa.api.dto.customer.CustomerResponse;
import com.kassa.api.entity.Customer;
import com.kassa.api.entity.Organization;
import com.kassa.api.exception.ResourceNotFoundException;
import com.kassa.api.repository.CustomerRepository;
import com.kassa.api.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllByOrganization(UUID organizationId) {
        return customerRepository.findByOrganizationIdOrderByNameAsc(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(UUID id, UUID organizationId) {
        Customer customer = customerRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id.toString()));
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request, UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .organization(org)
                .build();

        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse update(UUID id, CustomerRequest request, UUID organizationId) {
        Customer customer = customerRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id.toString()));

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());

        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    @Transactional
    public void delete(UUID id, UUID organizationId) {
        Customer customer = customerRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id.toString()));
        customerRepository.delete(customer);
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .phone(c.getPhone())
                .email(c.getEmail())
                .address(c.getAddress())
                .organizationId(c.getOrganization().getId())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
