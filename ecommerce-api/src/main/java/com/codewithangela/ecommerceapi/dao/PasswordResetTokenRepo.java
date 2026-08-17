package com.codewithangela.ecommerceapi.dao;

import com.codewithangela.ecommerceapi.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser_Id(Integer userId);

    // Atomically marks the token as used and reports whether this call was the one that
    // claimed it, so concurrent/duplicate reset attempts on the same token can't race.
    @Modifying
    @Transactional
    @Query("update PasswordResetToken t set t.used = true where t.token = :token and t.used = false")
    int claim(@Param("token") String token);
}
