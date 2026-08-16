package com.codewithangela.ecommerceapi.service;


import com.codewithangela.ecommerceapi.dao.ProductRepo;
import com.codewithangela.ecommerceapi.model.Product;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    @Autowired
    private MediaService mediaService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ProductVectorService vectorService;


    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Optional<Product> getProductById(int id) {
        return repo.findById(id);
    }

    public Product addProduct(Product product) {
        Product saved = repo.save(product);
        inventoryService.createInventoryForProduct(saved);
        vectorService.indexProduct(saved);
        return saved;
    }

    public Optional<Product> deleteProduct(int id) {
        Optional<Product> existing = repo.findById(id);
        existing.ifPresent(product -> {
            if (product.getImageUrl() != null) {
                mediaService.deleteFile(product.getImageUrl());
            }
            repo.deleteById(id);
            vectorService.deleteProduct(id);
        });
        return existing;
    }

    public Product updateProduct(Product product) {

        // JPA does upsert operation, so save = update
        Product saved = repo.save(product);
        vectorService.indexProduct(saved);
        return saved;
    }

    public List<Product> searchProducts(String query, int topK) {
        List<Document> matches = vectorService.search(query, topK);

        List<Integer> productIds = matches.stream()
                .map(doc -> doc.getMetadata().get("productId"))
                .filter(Number.class::isInstance)
                .map(value -> ((Number) value).intValue())
                .toList();

        Map<Integer, Product> byId = new LinkedHashMap<>();
        repo.findAllById(productIds)
                .forEach(product -> byId.put(product.getId(), product));

        return productIds.stream()
                .map(byId::get)
                .filter(product -> product != null)
                .toList();
    }

    public void reindexAllProducts() {
        vectorService.clearAll();
        repo.findAll().forEach(vectorService::indexProduct);
    }
}
