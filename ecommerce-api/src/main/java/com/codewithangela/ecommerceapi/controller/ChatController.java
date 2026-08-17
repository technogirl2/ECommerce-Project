package com.codewithangela.ecommerceapi.controller;

import com.codewithangela.ecommerceapi.dto.ChatRequest;
import com.codewithangela.ecommerceapi.dto.ChatResponse;
import com.codewithangela.ecommerceapi.service.ProductAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    @Autowired
    private ProductAssistantService productAssistantService;

    @PostMapping("chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        ProductAssistantService.ChatResult result = productAssistantService.chat(request.messages());
        return new ChatResponse(result.reply(), result.products());
    }
}
