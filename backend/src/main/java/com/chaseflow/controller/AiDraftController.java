package com.chaseflow.controller;

import com.chaseflow.dto.request.AiDraftUpdateRequest;
import com.chaseflow.dto.response.AiDraftResponse;
import com.chaseflow.service.AiDraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
public class AiDraftController {

    private final AiDraftService aiDraftService;

    @GetMapping
    public ResponseEntity<Page<AiDraftResponse>> listPendingDrafts(Pageable pageable) {
        return ResponseEntity.ok(aiDraftService.listPendingDrafts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiDraftResponse> getDraft(@PathVariable Long id) {
        return ResponseEntity.ok(aiDraftService.getDraft(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AiDraftResponse> updateDraft(
            @PathVariable Long id, @RequestBody AiDraftUpdateRequest request) {
        return ResponseEntity.ok(aiDraftService.updateDraft(id, request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<AiDraftResponse> approveDraft(@PathVariable Long id) {
        return ResponseEntity.ok(aiDraftService.approveDraft(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<AiDraftResponse> rejectDraft(@PathVariable Long id) {
        return ResponseEntity.ok(aiDraftService.rejectDraft(id));
    }
}
