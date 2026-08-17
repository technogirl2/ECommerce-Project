package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.PasswordResetTokenRepo;
import com.codewithangela.ecommerceapi.dao.RefreshTokenRepo;
import com.codewithangela.ecommerceapi.dao.UserRepo;
import com.codewithangela.ecommerceapi.exception.EmailSendException;
import com.codewithangela.ecommerceapi.exception.InvalidResetTokenException;
import com.codewithangela.ecommerceapi.model.PasswordResetToken;
import com.codewithangela.ecommerceapi.model.User;
import com.codewithangela.ecommerceapi.util.EmailTemplateLoader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class PasswordResetService {
    @Value("${email.resetPasswordExpirationMs}")
    private Long resetExpirationMs;

    @Value("${app.frontendUrl}")
    private String frontendUrl;

    private final PasswordResetTokenRepo tokenRepository;
    private final UserRepo userRepository;
    private final RefreshTokenRepo refreshTokenRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public PasswordResetService(PasswordResetTokenRepo tokenRepository, UserRepo userRepository,
                                 RefreshTokenRepo refreshTokenRepository, EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailService = emailService;
    }

    public void requestReset(String email) {
        User user = userRepository.findByEmail(email);
        // Don't reveal whether the account exists - the controller always returns the same message.
        if (user == null) return;

        tokenRepository.findByUser_Id(user.getId()).ifPresent(tokenRepository::delete);

        var token = new PasswordResetToken();
        token.setUser(user);
        token.setExpiryDate(Instant.now().plusMillis(resetExpirationMs));
        token.setToken(UUID.randomUUID().toString());
        tokenRepository.save(token);

        String link = frontendUrl + "/reset-password?token=" + token.getToken();
        String htmlBody = buildResetEmail(link);

        try {
            emailService.sendHtmlEmail(user.getEmail(), "Reset your Tastella password", htmlBody);
        } catch (EmailSendException e) {
            System.out.println("Failed to send password reset email to " + user.getEmail() + ": " + e.getMessage());
        }
    }

    public void reset(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new InvalidResetTokenException("Invalid password reset token.");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password is required.");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidResetTokenException("Invalid password reset token."));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            tokenRepository.delete(resetToken);
            throw new InvalidResetTokenException("Password reset link has expired.");
        }

        if (tokenRepository.claim(token) == 0) {
            // A concurrent/duplicate reset call already claimed this token.
            throw new InvalidResetTokenException("This password reset link has already been used.");
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);

        // Resetting the password ends any sessions started before the reset.
        refreshTokenRepository.findByUser_Id(user.getId()).ifPresent(refreshTokenRepository::delete);
    }

    private String buildResetEmail(String link) {
        String template = EmailTemplateLoader.load("reset-password-email.html");
        return EmailTemplateLoader.render(template, Map.of("link", link));
    }
}
