package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Integer> {
    long countBySnackType_Id(int snackTypeId);
}
