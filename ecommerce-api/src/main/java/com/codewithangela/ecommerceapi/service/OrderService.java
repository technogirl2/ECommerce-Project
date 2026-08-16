package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.constants.DeliveryOption;
import com.codewithangela.ecommerceapi.constants.OrderStatus;
import com.codewithangela.ecommerceapi.constants.PaymentStatus;
import com.codewithangela.ecommerceapi.dao.OrderItemRepo;
import com.codewithangela.ecommerceapi.dao.OrderRepo;
import com.codewithangela.ecommerceapi.dto.CheckoutRequest;
import com.codewithangela.ecommerceapi.dto.OrderTrendPointDto;
import com.codewithangela.ecommerceapi.dto.TopProductDto;
import com.codewithangela.ecommerceapi.exception.EmailSendException;
import com.codewithangela.ecommerceapi.model.*;
import com.codewithangela.ecommerceapi.util.EmailTemplateLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.sql.Timestamp;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a").withZone(ZoneId.systemDefault());

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontendUrl}")
    private String frontendUrl;

    @Transactional
    public Optional<Order> checkout(User user, CheckoutRequest request) {
        Cart cart = cartService.getCartForUser(user);
        if (cart.getItems().isEmpty()) {
            return Optional.empty();
        }
        if (request.deliveryOption() == DeliveryOption.SCHEDULED && request.scheduledTime() == null) {
            return Optional.empty();
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setStreet(request.street());
        order.setCity(request.city());
        order.setState(request.state());
        order.setZip(request.zip());
        order.setInstructions(request.instructions());
        order.setDeliveryOption(request.deliveryOption());
        order.setScheduledTime(request.deliveryOption() == DeliveryOption.SCHEDULED ? request.scheduledTime() : null);

        double subtotal = cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
        double deliveryFee = deliveryFeeFor(request.deliveryOption());
        double tax = round(subtotal * 0.08);

        order.setSubtotal(round(subtotal));
        order.setDeliveryFee(deliveryFee);
        order.setTax(tax);
        order.setTotal(round(subtotal + deliveryFee + tax));

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setUnitPrice(cartItem.getProduct().getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            order.getItems().add(orderItem);
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setProvider("mock");
        payment.setProviderPaymentId(UUID.randomUUID().toString());
        payment.setCardBrand(request.cardBrand());
        payment.setLast4(request.last4());
        payment.setStatus(PaymentStatus.SUCCEEDED);
        order.setPayment(payment);

        Order savedOrder = orderRepo.save(order);
        cartService.clearCart(cart);
        sendOrderConfirmationEmail(savedOrder);

        return Optional.of(savedOrder);
    }

    private void sendOrderConfirmationEmail(Order order) {
        try {
            int orderNumber = orderRepo.countByUserIdAndIdLessThanEqual(order.getUser().getId(), order.getId());
            String subject = "Your Tastella order #" + orderNumber + " is confirmed!";
            emailService.sendHtmlEmail(order.getUser().getEmail(), subject, buildOrderConfirmationEmail(order, orderNumber));
        } catch (EmailSendException e) {
            // Don't fail checkout if the confirmation email fails to send.
            System.out.println("Failed to send order confirmation email for order " + order.getId() + ": " + e.getMessage());
        }
    }

    private String buildOrderConfirmationEmail(Order order, int orderNumber) {
        NumberFormat currency = NumberFormat.getCurrencyInstance(Locale.US);

        String itemRowTemplate = EmailTemplateLoader.load("order-item-row.html");
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            itemsHtml.append(EmailTemplateLoader.render(itemRowTemplate, Map.of(
                    "productName", HtmlUtils.htmlEscape(item.getProductName()),
                    "quantity", String.valueOf(item.getQuantity()),
                    "lineTotal", currency.format(item.getUnitPrice() * item.getQuantity())
            )));
        }

        String deliveryLine = order.getDeliveryOption() == DeliveryOption.SCHEDULED && order.getScheduledTime() != null
                ? "Scheduled for " + DATE_FORMATTER.format(order.getScheduledTime())
                : order.getDeliveryOption().name().charAt(0) + order.getDeliveryOption().name().substring(1).toLowerCase() + " delivery";

        String orderLink = frontendUrl + "/orders/" + order.getId();

        Map<String, String> values = new HashMap<>();
        values.put("orderId", String.valueOf(orderNumber));
        values.put("orderDate", DATE_FORMATTER.format(order.getCreatedAt()));
        values.put("itemsHtml", itemsHtml.toString());
        values.put("subtotal", currency.format(order.getSubtotal()));
        values.put("deliveryFee", currency.format(order.getDeliveryFee()));
        values.put("tax", currency.format(order.getTax()));
        values.put("total", currency.format(order.getTotal()));
        values.put("street", HtmlUtils.htmlEscape(order.getStreet()));
        values.put("city", HtmlUtils.htmlEscape(order.getCity()));
        values.put("state", HtmlUtils.htmlEscape(order.getState()));
        values.put("zip", HtmlUtils.htmlEscape(order.getZip()));
        values.put("deliveryLine", deliveryLine);
        values.put("orderLink", orderLink);

        String template = EmailTemplateLoader.load("order-confirmation-email.html");
        return EmailTemplateLoader.render(template, values);
    }

    public List<Order> getOrdersForUser(User user) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Optional<Order> getOrderForUser(User user, int orderId) {
        return orderRepo.findByIdAndUserId(orderId, user.getId());
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Optional<Order> getOrderById(int orderId) {
        return orderRepo.findById(orderId);
    }

    public List<OrderTrendPointDto> getOrderTrends(int days) {
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return orderRepo.findOrderTrendsSince(since).stream()
                .map(row -> new OrderTrendPointDto(
                        toInstant(row[0]),
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).doubleValue()))
                .toList();
    }

    private static Instant toInstant(Object value) {
        return value instanceof Timestamp timestamp ? timestamp.toInstant() : (Instant) value;
    }

    public List<TopProductDto> getTopProducts(int days, int limit) {
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return orderItemRepo.findTopProductsSince(since, PageRequest.of(0, limit));
    }

    private double deliveryFeeFor(DeliveryOption option) {
        return switch (option) {
            case STANDARD -> 4.99;
            case PRIORITY -> 9.99;
            case SCHEDULED -> 6.99;
        };
    }

    private double round(double value) {
        return Math.round(value * 100) / 100.0;
    }
}