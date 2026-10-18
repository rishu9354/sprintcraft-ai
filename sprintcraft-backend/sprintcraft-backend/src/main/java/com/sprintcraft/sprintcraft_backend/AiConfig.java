package com.sprintcraft;

import dev.langchain4j.model.chat.Capability;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.service.AiServices;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AiConfig implements WebMvcConfigurer {

    @Bean
    ChatModel chatModel(@Value("${sprintcraft.ollama.base-url}") String url,
                        @Value("${sprintcraft.ollama.model}") String model) {
        return OllamaChatModel.builder()
            .baseUrl(url)
            .modelName(model)
            .temperature(0.2)                                        // low temp = stable, parseable JSON
            .timeout(Duration.ofSeconds(180))                        // local LLaMA can be slow on first token
            .supportedCapabilities(Capability.RESPONSE_FORMAT_JSON_SCHEMA) // forces schema-valid structured output
            .build();
    }

    @Bean
    SprintArchitect sprintArchitect(ChatModel model) {
        return AiServices.create(SprintArchitect.class, model);
    }

    // Let the Vite dev server call this API from the browser
    @Value("${sprintcraft.allowed-origin}")
    private String allowedOrigin;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(allowedOrigin).allowedMethods("GET", "POST");
    }
}
