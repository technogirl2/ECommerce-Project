package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.CartItemRepo;
import com.codewithangela.ecommerceapi.dao.CartRepo;
import com.codewithangela.ecommerceapi.dao.ProductRepo;
import com.codewithangela.ecommerceapi.model.Cart;
import com.codewithangela.ecommerceapi.model.CartItem;
import com.codewithangela.ecommerceapi.model.Product;
import com.codewithangela.ecommerceapi.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private ProductRepo productRepo;

    public Cart getCartForUser(User user) {
        return cartRepo.findByUserId(user.getId())
                .orElseGet(() -> createCartForUser(user));
    }

    private Cart createCartForUser(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepo.save(cart);
    }

    public Optional<Cart> addItem(User user, int productId, int quantity) {
        Optional<Product> product = productRepo.findById(productId);
        if (product.isEmpty()) {
            return Optional.empty();
        }

        Cart cart = getCartForUser(user);
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product.get());
        item.setQuantity(quantity);
        cart.getItems().add(cartItemRepo.save(item));

        return Optional.of(cart);
    }

    public Optional<Integer> getProductIdForItem(User user, int itemId) {
        Cart cart = getCartForUser(user);
        return findItemInCart(cart, itemId).map(item -> item.getProduct().getId());
    }

    public Optional<Cart> updateItemQuantity(User user, int itemId, int quantity) {
        Cart cart = getCartForUser(user);
        Optional<CartItem> existingItem = findItemInCart(cart, itemId);
        if (existingItem.isEmpty()) {
            return Optional.empty();
        }

        CartItem item = existingItem.get();
        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepo.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepo.save(item);
        }

        return Optional.of(cart);
    }

    public Optional<Cart> removeItem(User user, int itemId) {
        Cart cart = getCartForUser(user);
        Optional<CartItem> existingItem = findItemInCart(cart, itemId);
        if (existingItem.isEmpty()) {
            return Optional.empty();
        }

        cart.getItems().remove(existingItem.get());
        cartItemRepo.delete(existingItem.get());
        return Optional.of(cart);
    }

    private Optional<CartItem> findItemInCart(Cart cart, int itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId() == itemId)
                .findFirst();
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepo.save(cart);
    }
}