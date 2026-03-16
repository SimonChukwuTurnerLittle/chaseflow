package com.chaseflow.controller;

import com.chaseflow.dto.request.TemplateRequest;
import com.chaseflow.dto.response.TemplateResponse;
import com.chaseflow.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services/{serviceId}/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> listTemplates(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(templateService.listTemplates(serviceId));
    }

    @PutMapping("/{stepNumber}/{channel}")
    public ResponseEntity<TemplateResponse> upsertTemplate(
            @PathVariable UUID serviceId,
            @PathVariable Integer stepNumber,
            @PathVariable String channel,
            @RequestBody TemplateRequest request) {
        return ResponseEntity.ok(templateService.upsertTemplate(serviceId, stepNumber, channel, request));
    }
}
