package com.kassa.api.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, String identifier) {
        super(resource + " not found: " + identifier, HttpStatus.NOT_FOUND);
    }
}
