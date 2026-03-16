package com.chaseflow.integration;

import com.chaseflow.domain.Activity;
import com.chaseflow.domain.enums.TemplateType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ClaudeApiClient {

    @Value("${app.anthropic.api-key}")
    private String apiKey;

    @Value("${app.anthropic.model}")
    private String model;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public record AiGeneratedContent(String subject, String content) {}

    public AiGeneratedContent generateChaseMessage(String contactFirstName, String serviceName,
                                                     String temperature, int stepNumber,
                                                     String aiPromptHint, TemplateType channel,
                                                     List<Activity> activityHistory) {
        String activitySummary = activityHistory.stream()
                .map(a -> a.getDateAdded() + ": " + a.getDescription())
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
                You are a professional business assistant helping a UK micro business \
                follow up with leads. Generate a chase message that is professional, \
                concise, and appropriate for the channel. Do not include any subject line \
                in the body content. Return JSON with keys "subject" (null for SMS/WhatsApp) \
                and "content". For EMAIL, return HTML content. For SMS/WhatsApp, return plain text. \
                SMS must be under 160 characters. WhatsApp must be under 1024 characters.""";

        String userPrompt = String.format("""
                Contact name: %s
                Service: %s
                Temperature: %s
                Step number: %d
                Channel: %s
                Prompt hint: %s
                Activity history:
                %s

                Generate the chase message as JSON with "subject" and "content" keys.""",
                contactFirstName, serviceName, temperature, stepNumber,
                channel.name(), aiPromptHint != null ? aiPromptHint : "", activitySummary);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", 1024,
                    "system", systemPrompt,
                    "messages", List.of(Map.of("role", "user", "content", userPrompt))
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.anthropic.com/v1/messages",
                    HttpMethod.POST, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String textContent = root.path("content").get(0).path("text").asText();

            // Parse the JSON response from Claude
            JsonNode parsed = objectMapper.readTree(textContent);
            String subject = parsed.has("subject") && !parsed.get("subject").isNull()
                    ? parsed.get("subject").asText() : null;
            String content = parsed.get("content").asText();

            return new AiGeneratedContent(subject, content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate AI draft via Claude API", e);
        }
    }
}
