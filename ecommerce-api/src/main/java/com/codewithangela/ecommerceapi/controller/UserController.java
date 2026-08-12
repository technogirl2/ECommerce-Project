package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.constants.Role;
import com.codewithangela.ecommerceapi.dao.RefreshTokenRepo;
import com.codewithangela.ecommerceapi.dto.AuthResponse;
import com.codewithangela.ecommerceapi.dto.ChangePasswordRequest;
import com.codewithangela.ecommerceapi.dto.RefreshTokenRequest;
import com.codewithangela.ecommerceapi.dto.ResendVerificationRequest;
import com.codewithangela.ecommerceapi.dto.VerifyEmailRequest;
import com.codewithangela.ecommerceapi.exception.InvalidVerificationTokenException;
import com.codewithangela.ecommerceapi.model.User;
import com.codewithangela.ecommerceapi.service.EmailVerificationService;
import com.codewithangela.ecommerceapi.service.JWTService;
import com.codewithangela.ecommerceapi.service.RefreshTokenService;
import com.codewithangela.ecommerceapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private RefreshTokenRepo refreshTokenRepository;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @GetMapping("users")
    public List<User> getUsers() {
        return userService.getUsers();
    }

    @PostMapping("user-login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            // authenticate() throws BadCredentialsException on failure, so reaching
            // this line means auth succeeded
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "EMAIL_NOT_VERIFIED"));
        }

        User authenticatedUser = userService.getUserByEmail(user.getEmail());
        String accessToken = jwtService.generateToken(authenticatedUser.getEmail(), authenticatedUser.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(authenticatedUser.getId()).getToken();

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));
    }

    @PostMapping("user-register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.getUserByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already exists."));
        }

        String rawPassword = user.getPassword();
        user.setPassword(encoder.encode(rawPassword));
        user.setRole(Role.USER); // never trust a client-supplied role on self-registration
        User savedUser = userService.saveUser(user);
        emailVerificationService.issueAndSendToken(savedUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("email", savedUser.getEmail()));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        try {
            emailVerificationService.verify(request.token());
        } catch (InvalidVerificationTokenException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }

    @PostMapping("/user-resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody ResendVerificationRequest request) {
        emailVerificationService.resend(request.email());
        return ResponseEntity.ok(Map.of("message",
                "If that account exists and needs verification, we've sent an email."));
    }

    @PostMapping("/user-refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String requestToken = request.refreshToken();
        System.out.println("hitting refresh token end point");
        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    if (refreshTokenService.isTokenExpired(token)) {
                        refreshTokenRepository.delete(token);
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Refresh token expired. Please login again."));
                    }
                    String newJwt = jwtService.generateToken(token.getUser().getEmail(), token.getUser().getRole().name());
                    return ResponseEntity.ok(Map.of("token", newJwt));
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("error", "Invalid refresh token.")));
    }

    @PutMapping("user-password")
    public ResponseEntity<?> changePassword(Authentication authentication,
                                             @RequestBody ChangePasswordRequest request) {
        User user = userService.getUserByEmail(authentication.getName());

        if (!encoder.matches(request.oldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Current password is incorrect."));
        }

        if (request.newPassword() == null || request.newPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password is required."));
        }

        userService.updatePassword(user, encoder.encode(request.newPassword()));

        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    @PostMapping("/user-logout")
    public ResponseEntity<?> logoutUser(@RequestBody Map<String, String> payload) {
        String requestToken = payload.get("refreshToken");

        if (requestToken == null || requestToken.isBlank()) {
            return ResponseEntity.badRequest().body("Refresh token is required.");
        }

        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    refreshTokenRepository.delete(token);
                    return ResponseEntity.ok("Logged out successfully.");
                })
                .orElse(ResponseEntity.badRequest().body("Invalid refresh token."));
    }
}
