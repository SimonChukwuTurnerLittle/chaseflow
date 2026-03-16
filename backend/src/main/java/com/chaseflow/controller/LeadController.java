package com.chaseflow.controller;

import com.chaseflow.dto.request.LeadRequest;
import com.chaseflow.dto.request.NoteRequest;
import com.chaseflow.dto.response.*;
import com.chaseflow.service.LeadService;
import com.chaseflow.service.OpportunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;
    private final OpportunityService opportunityService;

    @GetMapping
    public ResponseEntity<Page<LeadResponse>> listLeads(
            @RequestParam(required = false) String source, Pageable pageable) {
        return ResponseEntity.ok(leadService.listLeads(source, pageable));
    }

    @PostMapping
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody LeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadResponse> getLead(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getLead(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeadResponse> updateLead(@PathVariable UUID id, @Valid @RequestBody LeadRequest request) {
        return ResponseEntity.ok(leadService.updateLead(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/opportunities")
    public ResponseEntity<List<OpportunityResponse>> getOpportunities(@PathVariable UUID id) {
        return ResponseEntity.ok(opportunityService.getOpportunitiesForLead(id));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<NoteResponse>> getNotes(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getNotes(id));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<NoteResponse> addNote(@PathVariable UUID id, @Valid @RequestBody NoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.addNote(id, request));
    }

    @GetMapping("/{id}/files")
    public ResponseEntity<List<RelatedFileResponse>> getFiles(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getFiles(id));
    }

    @PostMapping("/{id}/files")
    public ResponseEntity<RelatedFileResponse> uploadFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.uploadFile(id, file, description));
    }
}
