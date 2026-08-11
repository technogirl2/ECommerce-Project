package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.dto.AddCartItemRequest;
import com.codewithangela.ecommerceapi.dto.UpdateCartItemRequest;
import com.codewithangela.ecommerceapi.model.Cart;
import com.codewithangela.ecommerceapi.model.Inventory;
import com.codewithangela.ecommerceapi.model.User;
import com.codewithangela.ecommerceapi.service.CartService;
import com.codewithangela.ecommerceapi.service.InventoryService;
import com.codewithangela.ecommerceapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("cart")
    public Cart getCart(Authentication authentication) {
        return cartService.getCartForUser(currentUser(authentication));
    }

    @PostMapping("cart/items")
    public ResponseEntity<?> addItem(Authentication authentication, @RequestBody AddCartItemRequest request) {
        int availableQuantity = inventoryService.getInventoryByProductId(request.productId())
                .map(Inventory::getQuantity)
                .orElse(0);
        if (availableQuantity <= 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "This product is out of stock."));
        }
        if (request.quantity() > availableQuantity) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Only " + availableQuantity + " left in stock."));
        }

        return cartService.addItem(currentUser(authentication), request.productId(), request.quantity())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("cart/items/{itemId}")
    public ResponseEntity<?> updateItemQuantity(Authentication authentication, @PathVariable int itemId,
                                                     @RequestBody UpdateCartItemRequest request) {
        User user = currentUser(authentication);

        if (request.quantity() > 0) {
            Optional<Integer> productId = cartService.getProductIdForItem(user, itemId);
            if (productId.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            int availableQuantity = inventoryService.getInventoryByProductId(productId.get())
                    .map(Inventory::getQuantity)
                    .orElse(0);
            if (request.quantity() > availableQuantity) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Only " + availableQuantity + " left in stock."));
            }
        }

        return cartService.updateItemQuantity(user, itemId, request.quantity())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("cart/items/{itemId}")
    public ResponseEntity<Cart> removeItem(Authentication authentication, @PathVariable int itemId) {
        return cartService.removeItem(currentUser(authentication), itemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private User currentUser(Authentication authentication) {
        return userService.getUserByUsername(authentication.getName());
    }
}
