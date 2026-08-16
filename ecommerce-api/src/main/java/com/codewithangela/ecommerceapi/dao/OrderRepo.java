package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, Integer> {
    List<Order> findByUserIdOrderByCreatedAtDesc(int userId);

    Optional<Order> findByIdAndUserId(int id, int userId);

    int countByUserIdAndIdLessThanEqual(int userId, int id);

    @Query(value = """
            SELECT date_trunc('day', created_at) AS day, COUNT(*) AS order_count, SUM(total) AS revenue
            FROM orders
            WHERE created_at >= :since
            GROUP BY day
            ORDER BY day
            """, nativeQuery = true)
    List<Object[]> findOrderTrendsSince(@Param("since") Instant since);
}