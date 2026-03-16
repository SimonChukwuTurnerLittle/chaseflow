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
@RequestMapping("/api/v1/services/sequences/{sequenceId}/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> listTemplates(@PathVariable UUID sequenceId) {
        return ResponseEntity.ok(templateService.listTemplates(sequenceId));
    }

    @PutMapping("/{channel}")
    public ResponseEntity<TemplateResponse> upsertTemplate(
            @PathVariable UUID sequenceId, @PathVariable String channel,
            @RequestBody TemplateRequest request) {
        return ResponseEntity.ok(templateService.upsertTemplate(sequenceId, channel, request));
    }
}
