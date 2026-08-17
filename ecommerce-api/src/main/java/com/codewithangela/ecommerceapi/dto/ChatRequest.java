package com.codewithangela.ecommerceapi.dto;

import java.util.List;

public record ChatRequest(List<ChatMessageDto> messages) {}
