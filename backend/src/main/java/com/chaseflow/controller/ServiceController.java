package com.chaseflow.controller;

import com.chaseflow.dto.request.ServiceRequest;
import com.chaseflow.dto.response.ServiceResponse;
import com.chaseflow.service.ServiceManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceManagementService serviceManagementService;

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> listServices() {
        return ResponseEntity.ok(serviceManagementService.listServices());
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> createService(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceManagementService.createService(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getService(@PathVariable Long id) {
        return ResponseEntity.ok(serviceManagementService.getService(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(serviceManagementService.updateService(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceManagementService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
