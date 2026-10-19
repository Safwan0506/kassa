package com.kassa.api.exception;

public class InsufficientStockException extends BusinessException {

    public InsufficientStockException(int available, int requested) {
        super("Insufficient stock: available=" + available + ", requested=" + requested);
    }
}
