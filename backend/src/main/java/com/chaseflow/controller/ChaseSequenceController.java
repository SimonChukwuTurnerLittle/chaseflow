package com.chaseflow.controller;

import com.chaseflow.dto.request.ChaseSequenceRequest;
import com.chaseflow.dto.response.ChaseSequenceResponse;
import com.chaseflow.service.ChaseSequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services/{serviceId}/channels/{channelId}/sequences")
@RequiredArgsConstructor
public class ChaseSequenceController {

    private final ChaseSequenceService chaseSequenceService;

    @GetMapping
    public ResponseEntity<List<ChaseSequenceResponse>> listSequences(
            @PathVariable UUID serviceId, @PathVariable UUID channelId) {
        return ResponseEntity.ok(chaseSequenceService.listSequences(serviceId, channelId));
    }

    @PostMapping
    public ResponseEntity<ChaseSequenceResponse> addStep(
            @PathVariable UUID serviceId, @PathVariable UUID channelId,
            @RequestBody ChaseSequenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chaseSequenceService.addStep(serviceId, channelId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChaseSequenceResponse> updateStep(
            @PathVariable UUID serviceId, @PathVariable UUID channelId,
            @PathVariable UUID id, @RequestBody ChaseSequenceRequest request) {
        return ResponseEntity.ok(chaseSequenceService.updateStep(serviceId, channelId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStep(
            @PathVariable UUID serviceId, @PathVariable UUID channelId, @PathVariable UUID id) {
        chaseSequenceService.deleteStep(serviceId, channelId, id);
        return ResponseEntity.noContent().build();
    }
}
