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
@RequestMapping("/api/v1/services/{serviceId}/sequences")
@RequiredArgsConstructor
public class ChaseSequenceController {

    private final ChaseSequenceService chaseSequenceService;

    @GetMapping
    public ResponseEntity<List<ChaseSequenceResponse>> listSequences(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(chaseSequenceService.listSequences(serviceId));
    }

    @PostMapping
    public ResponseEntity<ChaseSequenceResponse> addStep(
            @PathVariable UUID serviceId, @RequestBody ChaseSequenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chaseSequenceService.addStep(serviceId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChaseSequenceResponse> updateStep(
            @PathVariable UUID serviceId, @PathVariable UUID id, @RequestBody ChaseSequenceRequest request) {
        return ResponseEntity.ok(chaseSequenceService.updateStep(serviceId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable UUID serviceId, @PathVariable UUID id) {
        chaseSequenceService.deleteStep(serviceId, id);
        return ResponseEntity.noContent().build();
    }
}
