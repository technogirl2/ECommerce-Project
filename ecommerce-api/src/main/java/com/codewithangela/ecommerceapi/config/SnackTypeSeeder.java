package com.codewithangela.ecommerceapi.config;

import com.codewithangela.ecommerceapi.dao.SnackTypeRepo;
import com.codewithangela.ecommerceapi.model.SnackType;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * One-time seed of the snack types that used to be hardcoded in the SnackType enum, so the
 * migration from enum column to snack_type_id FK doesn't lose the existing options. Only inserts
 * when the table is empty, so it's safe to leave in place after new types are added via the API.
 */
@Component
@RequiredArgsConstructor
public class SnackTypeSeeder implements CommandLineRunner {

    private static final List<String> DEFAULT_SNACK_TYPES = List.of(
            "Cookies & Pastries",
            "Candies & Chocolates",
            "Jelly & Dried Fruit",
            "Chips",
            "Crackers",
            "Nuts",
            "Beverages",
            "Powdered & Brewed Drinks"
    );

    private final SnackTypeRepo snackTypeRepo;

    @Override
    public void run(String... args) {
        if (snackTypeRepo.count() > 0) {
            return;
        }
        DEFAULT_SNACK_TYPES.forEach(name -> {
            SnackType snackType = new SnackType();
            snackType.setName(name);
            snackTypeRepo.save(snackType);
        });
    }
}