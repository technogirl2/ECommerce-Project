package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.model.SnackType;
import com.codewithangela.ecommerceapi.service.SnackTypeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class SnackTypeController {
    @Autowired
    private SnackTypeService snackTypeService;

    @GetMapping("snack-types")
    public List<SnackType> getSnackTypes() {
        return snackTypeService.getAllSnackTypes();
    }

    @GetMapping("snack-types/{id}")
    public ResponseEntity<SnackType> getSnackTypeById(@PathVariable int id) {
        return snackTypeService.getSnackTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("add-snack-type")
    public ResponseEntity<SnackType> addSnackType(@RequestBody SnackType snackType) {
        SnackType saved = snackTypeService.addSnackType(snackType);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("update-snack-type/{id}")
    public ResponseEntity<?> updateSnackType(@PathVariable int id, @RequestBody SnackType snackType) {
        if (snackType.getName() == null || snackType.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Snack type name is required."));
        }

        return snackTypeService.updateSnackTypeName(id, snackType.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete-snack-type/{id}")
    public ResponseEntity<?> deleteSnackType(@PathVariable int id) {
        if (snackTypeService.getSnackTypeById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        long productCount = snackTypeService.countProductsUsingSnackType(id);
        if (productCount > 0) {
            String message = String.format(
                    "%d product%s %s this category, so it can't be deleted.",
                    productCount, productCount == 1 ? "" : "s", productCount == 1 ? "has" : "have");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", message));
        }

        return snackTypeService.deleteSnackType(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}