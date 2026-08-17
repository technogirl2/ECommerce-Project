package com.codewithangela.ecommerceapi.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
