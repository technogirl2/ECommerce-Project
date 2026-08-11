package com.codewithangela.ecommerceapi.service;


import com.codewithangela.ecommerceapi.dao.ProductRepo;
import com.codewithangela.ecommerceapi.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    @Autowired
    private MediaService mediaService;

    @Autowired
    private InventoryService inventoryService;


    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Optional<Product> getProductById(int id) {
        return repo.findById(id);
    }

    public Product addProduct(Product product) {
        Product saved = repo.save(product);
        inventoryService.createInventoryForProduct(saved);
        return saved;
    }

    public Optional<Product> deleteProduct(int id) {
        Optional<Product> existing = repo.findById(id);
        existing.ifPresent(product -> {
            if (product.getImageUrl() != null) {
                mediaService.deleteFile(product.getImageUrl());
            }
            repo.deleteById(id);
        });
        return existing;
    }

    public Product updateProduct(Product product) {

        // JPA dp upsert operation, so save = update
        return repo.save(product);
    }
}
