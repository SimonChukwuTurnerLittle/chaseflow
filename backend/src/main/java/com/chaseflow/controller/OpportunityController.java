package com.chaseflow.controller;

import com.chaseflow.dto.request.OpportunityRequest;
import com.chaseflow.dto.response.OpportunityResponse;
import com.chaseflow.service.OpportunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/opportunities")
@RequiredArgsConstructor
public class OpportunityController {

    private final OpportunityService opportunityService;

    @GetMapping
    public ResponseEntity<Page<OpportunityResponse>> listOpportunities(
            @RequestParam(required = false) String status, Pageable pageable) {
        return ResponseEntity.ok(opportunityService.listOpportunities(status, pageable));
    }

    @PostMapping
    public ResponseEntity<OpportunityResponse> createOpportunity(@RequestBody OpportunityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(opportunityService.createOpportunity(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OpportunityResponse> getOpportunity(@PathVariable UUID id) {
        return ResponseEntity.ok(opportunityService.getOpportunity(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OpportunityResponse> updateOpportunity(
            @PathVariable UUID id, @RequestBody OpportunityRequest request) {
        return ResponseEntity.ok(opportunityService.updateOpportunity(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpportunity(@PathVariable UUID id) {
        opportunityService.deleteOpportunity(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<OpportunityResponse> completeOpportunity(@PathVariable UUID id) {
        return ResponseEntity.ok(opportunityService.completeOpportunity(id));
    }
}
