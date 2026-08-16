package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.dto.CheckoutRequest;
import com.codewithangela.ecommerceapi.dto.OrderTrendPointDto;
import com.codewithangela.ecommerceapi.dto.TopProductDto;
import com.codewithangela.ecommerceapi.model.Order;
import com.codewithangela.ecommerceapi.model.User;
import com.codewithangela.ecommerceapi.service.OrderService;
import com.codewithangela.ecommerceapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @PostMapping("orders")
    public ResponseEntity<Order> checkout(Authentication authentication, @RequestBody CheckoutRequest request) {
        return orderService.checkout(currentUser(authentication), request)
                .map(order -> ResponseEntity.status(201).body(order))
                .orElse(ResponseEntity.badRequest().build());
    }

    @GetMapping("orders")
    public List<Order> getOrders(Authentication authentication) {
        return orderService.getOrdersForUser(currentUser(authentication));
    }

    @GetMapping("orders/{id}")
    public ResponseEntity<Order> getOrder(Authentication authentication, @PathVariable int id) {
        return orderService.getOrderForUser(currentUser(authentication), id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/orders/{id}")
    public ResponseEntity<Order> getOrderByIdAdmin(@PathVariable int id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/analytics/order-trends")
    public List<OrderTrendPointDto> getOrderTrends(@RequestParam(defaultValue = "30") int days) {
        int safeDays = Math.min(Math.max(days, 1), 365);
        return orderService.getOrderTrends(safeDays);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/analytics/top-products")
    public List<TopProductDto> getTopProducts(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "10") int limit) {
        return orderService.getTopProducts(days, limit);
    }

    private User currentUser(Authentication authentication) {
        return userService.getUserByEmail(authentication.getName());
    }
}