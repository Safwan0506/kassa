package com.kassa.api.dto.invoice;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInvoiceRequest {

    @NotNull(message = "Shop ID is required")
    private UUID shopId;

    private UUID customerId;

    @NotEmpty(message = "At least one line is required")
    @Valid
    private List<InvoiceLineRequest> lines;

    private String notes;
}
