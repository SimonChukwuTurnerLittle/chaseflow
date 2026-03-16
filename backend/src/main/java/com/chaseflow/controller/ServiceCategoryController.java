package com.chaseflow.controller;

import com.chaseflow.dto.request.ServiceCategoryRequest;
import com.chaseflow.dto.response.ServiceCategoryResponse;
import com.chaseflow.service.ServiceManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-categories")
@RequiredArgsConstructor
public class ServiceCategoryController {

    private final ServiceManagementService serviceManagementService;

    @GetMapping
    public ResponseEntity<List<ServiceCategoryResponse>> listCategories() {
        return ResponseEntity.ok(serviceManagementService.listCategories());
    }

    @PostMapping
    public ResponseEntity<ServiceCategoryResponse> createCategory(@Valid @RequestBody ServiceCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceManagementService.createCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceCategoryResponse> updateCategory(
            @PathVariable Long id, @Valid @RequestBody ServiceCategoryRequest request) {
        return ResponseEntity.ok(serviceManagementService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        serviceManagementService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
