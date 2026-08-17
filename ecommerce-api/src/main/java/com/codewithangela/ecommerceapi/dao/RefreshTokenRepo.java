package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser_Id(Integer userId);
    void deleteByExpiryDateBefore(Instant instant);
}
