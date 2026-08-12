package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.EmailVerificationTokenRepo;
import com.codewithangela.ecommerceapi.dao.UserRepo;
import com.codewithangela.ecommerceapi.exception.EmailSendException;
import com.codewithangela.ecommerceapi.exception.InvalidVerificationTokenException;
import com.codewithangela.ecommerceapi.model.EmailVerificationToken;
import com.codewithangela.ecommerceapi.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
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
        return """
                <div style="background:#f4f4f7;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                  <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e0eb;">
                    <h1 style="margin:0 0 16px;font-size:22px;color:#08060d;">Welcome to Tastella</h1>
                    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#4b4b52;">
                      Thanks for signing up! Confirm this is your email address to activate your account.
                    </p>
                    <p style="margin:0 0 24px;text-align:center;">
                      <a href="%s" style="display:inline-block;padding:12px 28px;background:#aa3bff;color:#ffffff;
                         border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;">
                        Verify my email
                      </a>
                    </p>
                    <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#8a8a92;">
                      This link expires in 24 hours. If the button doesn't work, copy and paste this URL into your browser:
                    </p>
                    <p style="margin:0;font-size:13px;word-break:break-all;">
                      <a href="%s" style="color:#aa3bff;">%s</a>
                    </p>
                    <p style="margin:24px 0 0;font-size:13px;color:#8a8a92;">
                      Didn't create a Tastella account? You can safely ignore this email.
                    </p>
                  </div>
                </div>
                """.formatted(link, link, link);
    }
}
