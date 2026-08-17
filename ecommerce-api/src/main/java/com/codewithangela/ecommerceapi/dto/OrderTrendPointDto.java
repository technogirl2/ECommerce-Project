package com.codewithangela.ecommerceapi.dto;

import java.time.Instant;

public record OrderTrendPointDto(Instant date, long orderCount, double revenue) {}
