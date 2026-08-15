package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.model.Product;
import com.codewithangela.ecommerceapi.service.MediaService;
import com.codewithangela.ecommerceapi.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class ProductController {
    @Autowired
    private ProductService productService;

    @Autowired
    private MediaService mediaService;

    @GetMapping ("products")
    public List<Product> getProducts() {

        return productService.getAllProducts();
    }

    @GetMapping("products/search")
    public List<Product> searchProducts(@RequestParam("q") String query,
                                         @RequestParam(value = "topK", defaultValue = "5") int topK) {
        return productService.searchProducts(query, topK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("products/reindex")
    public ResponseEntity<Void> reindexProducts() {
        productService.reindexAllProducts();
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "add-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> addProduct(@ModelAttribute Product product, @RequestParam("file") MultipartFile file) {
        product.setImageUrl(mediaService.uploadFile(file, "products"));
        Product saved = productService.addProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable int id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete-product/{id}")
    public ResponseEntity<Product> deleteProduct(@PathVariable int id) {
        return productService.deleteProduct(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "update-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProduct(@ModelAttribute Product product,
                               @RequestParam(value = "file", required = false) MultipartFile file) {
        String oldImageUrl = productService.getProductById(product.getId())
                .map(Product::getImageUrl)
                .orElse(null);

        boolean replacingImage = file != null && !file.isEmpty();
        product.setImageUrl(replacingImage ? mediaService.uploadFile(file, "products") : oldImageUrl);

        Product updated = productService.updateProduct(product);

        if (replacingImage && oldImageUrl != null) {
            mediaService.deleteFile(oldImageUrl);
        }

        return ResponseEntity.ok(updated);
    }
}
