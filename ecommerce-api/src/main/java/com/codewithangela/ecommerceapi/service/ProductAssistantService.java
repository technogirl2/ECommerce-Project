package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dto.ChatMessageDto;
import com.codewithangela.ecommerceapi.model.Product;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductAssistantService {

    private static final String SYSTEM_PROMPT = """
            You are the shopping assistant for Tastella, an online snack and drink store.
            Help customers find products using the search_products tool - call it whenever
            the customer asks about products, flavors, categories, or wants a recommendation.
            Only describe products, prices, or categories that were actually returned by the tool;
            never invent or assume product details. If the tool returns no good matches, say so
            honestly and suggest the customer try rephrasing. Keep replies short, friendly, and
            focused on helping them find something to buy.
            """;

    private final ChatClient chatClient;
    private final ProductSearchTools productSearchTools;

    public ProductAssistantService(ChatClient.Builder chatClientBuilder, ProductSearchTools productSearchTools) {
        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultTools(productSearchTools)
                .build();
        this.productSearchTools = productSearchTools;
    }

    public ChatResult chat(List<ChatMessageDto> history) {
        List<Message> messages = history.stream()
                .map(ProductAssistantService::toMessage)
                .toList();

        String reply = chatClient.prompt()
                .messages(messages)
                .call()
                .content();

        return new ChatResult(reply, productSearchTools.getLastResults());
    }

    private static Message toMessage(ChatMessageDto dto) {
        return "assistant".equalsIgnoreCase(dto.role())
                ? new AssistantMessage(dto.content())
                : new UserMessage(dto.content());
    }

    public record ChatResult(String reply, List<Product> products) {}
}
