package com.chaseflow.controller;

import com.chaseflow.dto.request.ActivityRequest;
import com.chaseflow.dto.response.ActivityResponse;
import com.chaseflow.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/opportunities/{opportunityId}/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> listActivities(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(activityService.listActivities(opportunityId));
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> logActivity(
            @PathVariable UUID opportunityId, @RequestBody ActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activityService.logActivity(opportunityId, request));
    }
}
