package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.model.SnackType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SnackTypeRepo extends JpaRepository<SnackType, Integer> {
}