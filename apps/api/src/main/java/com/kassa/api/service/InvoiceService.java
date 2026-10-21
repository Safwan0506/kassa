package com.kassa.api.service;

import com.kassa.api.dto.invoice.*;
import com.kassa.api.dto.payment.PaymentRequest;
import com.kassa.api.entity.*;
import com.kassa.api.exception.BusinessException;
import com.kassa.api.exception.InsufficientStockException;
import com.kassa.api.exception.ResourceNotFoundException;
import com.kassa.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;
    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Transactional
    public InvoiceResponse create(CreateInvoiceRequest request, UUID organizationId, UUID userId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop", request.getShopId().toString()));

        Invoice invoice = Invoice.builder()
                .organization(org)
                .shop(shop)
                .invoiceNumber(generateInvoiceNumber(organizationId))
                .status(InvoiceStatus.DRAFT)
                .createdBy(userId)
                .build();

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findByIdAndOrganizationId(request.getCustomerId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId().toString()));
            invoice.setCustomer(customer);
        }

        invoice.setNotes(request.getNotes());

        for (int i = 0; i < request.getLines().size(); i++) {
            InvoiceLineRequest lineReq = request.getLines().get(i);
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", lineReq.getProductId().toString()));

            InvoiceLine line = InvoiceLine.builder()
                    .invoice(invoice)
                    .product(product)
                    .productName(product.getName())
                    .quantity(lineReq.getQuantity())
                    .unitPrice(product.getSellPrice())
                    .tvaRate(product.getTvaRate())
                    .sortOrder(i)
                    .build();
            line.computeLineTotal();
            invoice.getLines().add(line);
        }

        invoice.recalculateTotals();
        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(UUID id, UUID organizationId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id.toString()));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> list(UUID organizationId, UUID shopId, InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findFiltered(organizationId, shopId, status, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public InvoiceResponse validate(UUID id, UUID organizationId, UUID userId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id.toString()));

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BusinessException("Only draft invoices can be validated", HttpStatus.BAD_REQUEST);
        }

        for (InvoiceLine line : invoice.getLines()) {
            UUID shopId = invoice.getShop().getId();
            UUID productId = line.getProduct().getId();

            StockLevel stockLevel = stockLevelRepository.findByShopIdAndProductId(shopId, productId)
                    .orElseThrow(() -> new BusinessException(
                            "No stock for product '" + line.getProductName() + "' in this shop",
                            HttpStatus.BAD_REQUEST));

            int newQty = stockLevel.getQuantity() - line.getQuantity();
            if (newQty < 0) {
                throw new InsufficientStockException(stockLevel.getQuantity(), line.getQuantity());
            }

            stockLevel.setQuantity(newQty);
            stockLevelRepository.save(stockLevel);

            StockMovement movement = StockMovement.builder()
                    .shop(invoice.getShop())
                    .product(line.getProduct())
                    .type(MovementType.EXIT)
                    .quantity(line.getQuantity())
                    .reason("Facture " + invoice.getInvoiceNumber())
                    .createdBy(userId)
                    .build();
            stockMovementRepository.save(movement);
        }

        invoice.setStatus(InvoiceStatus.VALIDATED);
        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse cancel(UUID id, UUID organizationId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id.toString()));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessException("Invoice is already cancelled", HttpStatus.BAD_REQUEST);
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessException("Cannot cancel a fully paid invoice", HttpStatus.BAD_REQUEST);
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse addPayment(PaymentRequest request, UUID organizationId, UUID userId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(request.getInvoiceId(), organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", request.getInvoiceId().toString()));

        if (invoice.getStatus() == InvoiceStatus.DRAFT) {
            throw new BusinessException("Cannot pay a draft invoice — validate it first", HttpStatus.BAD_REQUEST);
        }

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessException("Cannot pay a cancelled invoice", HttpStatus.BAD_REQUEST);
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessException("Invoice is already fully paid", HttpStatus.BAD_REQUEST);
        }

        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.getMethod());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid payment method: " + request.getMethod(), HttpStatus.BAD_REQUEST);
        }

        BigDecimal amountDue = invoice.getAmountDue();
        if (request.getAmount().compareTo(amountDue) > 0) {
            throw new BusinessException(
                    "Payment amount exceeds amount due (" + amountDue + " FCFA)",
                    HttpStatus.BAD_REQUEST);
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .method(method)
                .amount(request.getAmount())
                .reference(request.getReference())
                .notes(request.getNotes())
                .receivedBy(userId)
                .build();
        paymentRepository.save(payment);

        BigDecimal newAmountPaid = invoice.getAmountPaid().add(request.getAmount());
        invoice.setAmountPaid(newAmountPaid);

        if (newAmountPaid.compareTo(invoice.getTotal()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            notificationService.createInvoiceNotification(invoice, NotificationType.INVOICE_PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Invoice getEntityForPdf(UUID id, UUID organizationId) {
        return invoiceRepository.findByIdWithDetails(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id.toString()));
    }

    private String generateInvoiceNumber(UUID organizationId) {
        String datePrefix = "FAC-" + LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyyMM"));
        long count = invoiceRepository.countByPrefix(organizationId, datePrefix);
        return datePrefix + "-" + String.format("%04d", count + 1);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<InvoiceLineResponse> lineResponses = invoice.getLines().stream()
                .map(line -> InvoiceLineResponse.builder()
                        .id(line.getId())
                        .productId(line.getProduct().getId())
                        .productName(line.getProductName())
                        .quantity(line.getQuantity())
                        .unitPrice(line.getUnitPrice())
                        .tvaRate(line.getTvaRate())
                        .lineTotal(line.getLineTotal())
                        .build())
                .toList();

        List<PaymentResponse> paymentResponses = invoice.getPayments().stream()
                .map(p -> PaymentResponse.builder()
                        .id(p.getId())
                        .method(p.getMethod().name())
                        .amount(p.getAmount())
                        .reference(p.getReference())
                        .notes(p.getNotes())
                        .receivedBy(p.getReceivedBy())
                        .createdAt(p.getCreatedAt())
                        .build())
                .toList();

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .status(invoice.getStatus().name())
                .shopId(invoice.getShop().getId())
                .shopName(invoice.getShop().getName())
                .customerId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null)
                .customerName(invoice.getCustomer() != null ? invoice.getCustomer().getName() : null)
                .subtotal(invoice.getSubtotal())
                .taxTotal(invoice.getTaxTotal())
                .total(invoice.getTotal())
                .amountPaid(invoice.getAmountPaid())
                .amountDue(invoice.getAmountDue())
                .notes(invoice.getNotes())
                .createdBy(invoice.getCreatedBy())
                .lines(lineResponses)
                .payments(paymentResponses)
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}
