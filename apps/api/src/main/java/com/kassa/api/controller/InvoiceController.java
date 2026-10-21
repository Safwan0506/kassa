package com.kassa.api.controller;

import com.kassa.api.dto.PaginatedResponse;
import com.kassa.api.dto.invoice.CreateInvoiceRequest;
import com.kassa.api.dto.invoice.InvoiceResponse;
import com.kassa.api.dto.payment.PaymentRequest;
import com.kassa.api.entity.Invoice;
import com.kassa.api.entity.InvoiceStatus;
import com.kassa.api.entity.ShopRole;
import com.kassa.api.exception.BusinessException;
import com.kassa.api.security.SecurityHelper;
import com.kassa.api.service.InvoiceService;
import com.kassa.api.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PdfService pdfService;
    private final SecurityHelper securityHelper;

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody CreateInvoiceRequest request,
                                                   Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        UUID userId = securityHelper.getCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.create(request, orgId, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable UUID id,
                                                    Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(invoiceService.getById(id, orgId));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<InvoiceResponse>> list(
            @RequestParam(required = false) UUID shopId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);

        InvoiceStatus invoiceStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                invoiceStatus = InvoiceStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid invoice status: " + status, HttpStatus.BAD_REQUEST);
            }
        }

        Pageable pageable = PageRequest.of(page, limit);
        return ResponseEntity.ok(PaginatedResponse.from(
                invoiceService.list(orgId, shopId, invoiceStatus, pageable)));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<InvoiceResponse> validate(@PathVariable UUID id,
                                                     Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        UUID userId = securityHelper.getCurrentUserId(authentication);
        return ResponseEntity.ok(invoiceService.validate(id, orgId, userId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<InvoiceResponse> cancel(@PathVariable UUID id,
                                                   Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        return ResponseEntity.ok(invoiceService.cancel(id, orgId));
    }

    @PostMapping("/payments")
    public ResponseEntity<InvoiceResponse> addPayment(@Valid @RequestBody PaymentRequest request,
                                                       Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        UUID userId = securityHelper.getCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.addPayment(request, orgId, userId));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id,
                                               Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        Invoice invoice = invoiceService.getEntityForPdf(id, orgId);
        byte[] pdf = pdfService.generateInvoicePdf(invoice);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + invoice.getInvoiceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    @GetMapping("/{id}/delivery-note")
    public ResponseEntity<byte[]> downloadDeliveryNote(@PathVariable UUID id,
                                                        Authentication authentication) {
        securityHelper.requireRole(authentication,
                ShopRole.PROPRIETAIRE, ShopRole.GERANT, ShopRole.CAISSIER);
        UUID orgId = securityHelper.getCurrentOrganizationId(authentication);
        Invoice invoice = invoiceService.getEntityForPdf(id, orgId);
        byte[] pdf = pdfService.generateDeliveryNotePdf(invoice);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"BL-" + invoice.getInvoiceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}
