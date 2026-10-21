package com.kassa.api.dto.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {

    private UUID id;
    private String invoiceNumber;
    private String status;
    private UUID shopId;
    private String shopName;
    private UUID customerId;
    private String customerName;
    private BigDecimal subtotal;
    private BigDecimal taxTotal;
    private BigDecimal total;
    private BigDecimal amountPaid;
    private BigDecimal amountDue;
    private String notes;
    private UUID createdBy;
    private List<InvoiceLineResponse> lines;
    private List<PaymentResponse> payments;
    private Instant createdAt;
    private Instant updatedAt;
}
