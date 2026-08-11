package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.dto.UpdateInventoryRequest;
import com.codewithangela.ecommerceapi.model.Inventory;
import com.codewithangela.ecommerceapi.service.InventoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class InventoryController {
    @Autowired
    private InventoryService inventoryService;

    @GetMapping("inventory")
    public List<Inventory> getInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("inventory/{id}")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable int id) {
        return inventoryService.getInventoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("inventory/product/{productId}")
    public ResponseEntity<Inventory> getInventoryByProductId(@PathVariable int productId) {
        return inventoryService.getInventoryByProductId(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("update-inventory/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable int id, @RequestBody UpdateInventoryRequest request) {
        return inventoryService.updateQuantity(id, request.quantity())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete-inventory/{id}")
    public ResponseEntity<Inventory> deleteInventory(@PathVariable int id) {
        return inventoryService.deleteInventory(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}