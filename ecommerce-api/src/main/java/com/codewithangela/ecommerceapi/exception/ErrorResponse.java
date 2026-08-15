package com.codewithangela.ecommerceapi.exception;

import java.time.Instant;

public record ErrorResponse(Instant timestamp, int status, String error, String path) {
    public static ErrorResponse of(int status, String message, String path) {
        return new ErrorResponse(Instant.now(), status, message, path);
    }
}