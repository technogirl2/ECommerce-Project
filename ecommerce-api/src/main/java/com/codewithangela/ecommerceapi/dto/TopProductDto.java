package com.codewithangela.ecommerceapi.dto;

public record TopProductDto(int productId, String productName, String imageUrl, long quantitySold, double revenue) {}
