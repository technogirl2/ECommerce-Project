package com.codewithangela.ecommerceapi.config;

import com.codewithangela.ecommerceapi.dao.SnackTypeRepo;
import com.codewithangela.ecommerceapi.model.SnackType;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

/**
 * Lets the multipart {@code add-product}/{@code update-product} endpoints keep binding a plain
 * "snackType" form field (the SnackType id) straight onto Product.snackType via @ModelAttribute.
 */
@Component
@RequiredArgsConstructor
public class SnackTypeConverter implements Converter<String, SnackType> {

    private final SnackTypeRepo snackTypeRepo;

    @Override
    public SnackType convert(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        int id = Integer.parseInt(source);
        return snackTypeRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid snack type id: " + id));
    }
}