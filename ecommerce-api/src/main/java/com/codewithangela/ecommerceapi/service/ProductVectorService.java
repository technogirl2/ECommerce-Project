package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductVectorService {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.ai.vectorstore.pgvector.table-name}")
    private String vectorTableName;

    public void indexProduct(Product product) {
        vectorStore.add(List.of(toDocument(product)));
    }

    public void deleteProduct(int productId) {
        vectorStore.delete(List.of(documentId(productId)));
    }

    // Wipes the whole index rather than upserting per-product, so a rebuild also clears
    // rows left behind by past indexing formats/ids that would otherwise never get touched
    // by the current deterministic-id upsert (e.g. after a change to toDocument()).
    public void clearAll() {
        jdbcTemplate.update("DELETE FROM " + vectorTableName);
    }

    public List<Document> search(String query, int topK) {
        return vectorStore.similaritySearch(SearchRequest.builder()
                .query(query)
                .topK(topK)
                .build());
    }

    private Document toDocument(Product product) {
        String snackTypeName = product.getSnackType() != null ? product.getSnackType().getName() : "";
        String content = "%s , category: %s".formatted(product.getName(), snackTypeName);

        return Document.builder()
                .id(documentId(product.getId()))
                .text(content)
                .metadata("productId", product.getId())
                .build();
    }

    // Deterministic per-product id so re-indexing an existing product upserts its
    // vector row (PgVectorStore does INSERT ... ON CONFLICT (id) DO UPDATE) instead
    // of leaving orphaned rows behind.
    private String documentId(int productId) {
        return UUID.nameUUIDFromBytes(("product-" + productId).getBytes(StandardCharsets.UTF_8)).toString();
    }
}
