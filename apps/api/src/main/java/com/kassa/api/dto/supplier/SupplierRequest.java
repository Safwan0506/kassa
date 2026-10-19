package com.kassa.api.dto.supplier;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String phone;

    private String email;

    private String address;
}
