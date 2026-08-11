package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.InventoryRepo;
import com.codewithangela.ecommerceapi.model.Inventory;
import com.codewithangela.ecommerceapi.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepo repo;

    public List<Inventory> getAllInventory() {
        return repo.findAll();
    }

    public Optional<Inventory> getInventoryById(int id) {
        return repo.findById(id);
    }

    public Optional<Inventory> getInventoryByProductId(int productId) {
        return repo.findByProduct_Id(productId);
    }

    public Inventory createInventoryForProduct(Product product) {
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantity(0);
        return repo.save(inventory);
    }

    public Optional<Inventory> updateQuantity(int id, int quantity) {
        return repo.findById(id)
                .map(inventory -> {
                    inventory.setQuantity(quantity);
                    return repo.save(inventory);
                });
    }

    public Optional<Inventory> deleteInventory(int id) {
        Optional<Inventory> existing = repo.findById(id);
        existing.ifPresent(inventory -> repo.deleteById(id));
        return existing;
    }
}