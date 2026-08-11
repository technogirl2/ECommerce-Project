package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepo extends JpaRepository<Inventory, Integer> {
    Optional<Inventory> findByProduct_Id(int productId);
}
