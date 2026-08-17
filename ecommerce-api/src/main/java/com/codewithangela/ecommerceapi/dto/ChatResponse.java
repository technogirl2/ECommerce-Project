package com.codewithangela.ecommerceapi.dto;

import com.codewithangela.ecommerceapi.model.Product;

import java.util.List;

public record ChatResponse(String reply, List<Product> products) {}
