package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.dto.TopProductDto;
import com.codewithangela.ecommerceapi.model.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OrderItemRepo extends JpaRepository<OrderItem, Integer> {
    @Query("""
            SELECT new com.codewithangela.ecommerceapi.dto.TopProductDto(
                    oi.product.id, oi.productName, oi.product.imageUrl, SUM(oi.quantity), SUM(oi.unitPrice * oi.quantity))
            FROM OrderItem oi
            WHERE oi.order.createdAt >= :since
            GROUP BY oi.product.id, oi.productName, oi.product.imageUrl
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<TopProductDto> findTopProductsSince(@Param("since") Instant since, Pageable pageable);
}
