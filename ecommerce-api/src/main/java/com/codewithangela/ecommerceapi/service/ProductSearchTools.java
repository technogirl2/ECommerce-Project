package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.List;

@Component
@RequestScope(proxyMode = ScopedProxyMode.TARGET_CLASS)
@RequiredArgsConstructor
public class ProductSearchTools {

    private static final int MAX_RESULTS = 5;

    private final ProductService productService;

    private List<Product> lastResults = List.of();

    @Tool(name = "search_products",
            description = "Search the store's snack catalog by meaning, not just keywords. "
                    + "Use this whenever the customer asks about products, flavors, categories, "
                    + "or wants a recommendation. Returns the closest-matching products.")
    public List<ProductResult> searchProducts(
            @ToolParam(description = "A natural language description of what the customer wants, "
                    + "e.g. 'spicy chips' or 'sweet milk drink'") String query) {
        List<Product> products = productService.searchProducts(query, MAX_RESULTS);
        lastResults = products;
        return products.stream()
                .map(ProductResult::from)
                .toList();
    }

    public List<Product> getLastResults() {
        return lastResults;
    }

    public record ProductResult(int id, String name, String brand, double price, String category) {
        static ProductResult from(Product product) {
            String category = product.getSnackType() != null ? product.getSnackType().getName() : null;
            return new ProductResult(product.getId(), product.getName(), product.getBrand(), product.getPrice(), category);
        }
    }
}
