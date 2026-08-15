package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, Integer> {
    List<Order> findByUserIdOrderByCreatedAtDesc(int userId);

    Optional<Order> findByIdAndUserId(int id, int userId);

    int countByUserIdAndIdLessThanEqual(int userId, int id);
}