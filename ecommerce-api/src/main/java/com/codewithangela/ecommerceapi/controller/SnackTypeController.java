package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.model.SnackType;
import com.codewithangela.ecommerceapi.service.SnackTypeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @DeleteMapping("delete-snack-type/{id}")
    public ResponseEntity<SnackType> deleteSnackType(@PathVariable int id) {
        return snackTypeService.deleteSnackType(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}