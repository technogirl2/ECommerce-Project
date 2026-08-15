package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.EmailVerificationTokenRepo;
import com.codewithangela.ecommerceapi.dao.UserRepo;
import com.codewithangela.ecommerceapi.exception.EmailSendException;
import com.codewithangela.ecommerceapi.exception.InvalidVerificationTokenException;
import com.codewithangela.ecommerceapi.model.EmailVerificationToken;
import com.codewithangela.ecommerceapi.model.User;
import com.codewithangela.ecommerceapi.util.EmailTemplateLoader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class EmailVerificationService {
    @Value("${email.verificationExpirationMs}")
    private Long verificationExpirationMs;

    @Value("${app.frontendUrl}")
    private String frontendUrl;

    private final EmailVerificationTokenRepo tokenRepository;
    private final UserRepo userRepository;
    private final EmailService emailService;

    public EmailVerificationService(EmailVerificationTokenRepo tokenRepository, UserRepo userRepository,
                                     EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public void issueAndSendToken(User user) {
        tokenRepository.findByUser_Id(user.getId()).ifPresent(tokenRepository::delete);

        var token = new EmailVerificationToken();
        token.setUser(user);
        token.setExpiryDate(Instant.now().plusMillis(verificationExpirationMs));
        token.setToken(UUID.randomUUID().toString());
        tokenRepository.save(token);

        String link = frontendUrl + "/verify-email?token=" + token.getToken();
        String htmlBody = buildVerificationEmail(link);

        try {
            emailService.sendHtmlEmail(user.getEmail(), "Verify your Tastella account", htmlBody);
        } catch (EmailSendException e) {
            // Don't fail registration if the email fails to send - the user can request a resend later.
            System.out.println("Failed to send verification email to " + user.getEmail() + ": " + e.getMessage());
        }
    }

    public void verify(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidVerificationTokenException("Invalid verification token."));

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            tokenRepository.delete(verificationToken);
            throw new InvalidVerificationTokenException("Verification link has expired.");
        }

        if (tokenRepository.claim(token) == 0) {
            // A concurrent/duplicate verify call already claimed this token, so the user
            // is already being (or has been) marked verified by that call.
            return;
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
    }

    public void resend(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null && !user.isEmailVerified()) {
            issueAndSendToken(user);
        }
    }

    private String buildVerificationEmail(String link) {
        String template = EmailTemplateLoader.load("verification-email.html");
        return EmailTemplateLoader.render(template, Map.of("link", link));
    }
}
