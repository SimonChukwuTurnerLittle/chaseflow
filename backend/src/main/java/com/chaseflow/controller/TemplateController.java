package com.chaseflow.controller;

import com.chaseflow.dto.request.TemplateAssignRequest;
import com.chaseflow.dto.request.TemplateRequest;
import com.chaseflow.dto.response.TemplateResponse;
import com.chaseflow.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/unassigned")
    public ResponseEntity<List<TemplateResponse>> listUnassignedTemplates(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(templateService.listUnassignedTemplates(serviceId));
    }

    @PostMapping
    public ResponseEntity<TemplateResponse> createTemplate(
            @PathVariable UUID serviceId,
            @RequestBody TemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.createTemplate(serviceId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponse> updateTemplate(
            @PathVariable UUID serviceId,
            @PathVariable UUID id,
            @RequestBody TemplateRequest request) {
        return ResponseEntity.ok(templateService.updateTemplateById(serviceId, id, request));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<TemplateResponse> duplicateTemplate(
            @PathVariable UUID serviceId,
            @PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.duplicateTemplate(serviceId, id));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TemplateResponse> assignTemplate(
            @PathVariable UUID serviceId,
            @PathVariable UUID id,
            @RequestBody TemplateAssignRequest request) {
        return ResponseEntity.ok(templateService.assignTemplate(serviceId, id, request));
    }

    @PutMapping("/{id}/unassign")
    public ResponseEntity<TemplateResponse> unassignTemplate(
            @PathVariable UUID serviceId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(templateService.unassignTemplate(serviceId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable UUID serviceId,
            @PathVariable UUID id) {
        templateService.deleteTemplate(serviceId, id);
        return ResponseEntity.noContent().build();
    }

    // Legacy endpoint — kept for backward compatibility
    @PutMapping("/{stepNumber}/{channel}")
    public ResponseEntity<TemplateResponse> upsertTemplate(
            @PathVariable UUID serviceId,
            @PathVariable Integer stepNumber,
            @PathVariable String channel,
            @RequestBody TemplateRequest request) {
        return ResponseEntity.ok(templateService.upsertTemplate(serviceId, stepNumber, channel, request));
    }
}
