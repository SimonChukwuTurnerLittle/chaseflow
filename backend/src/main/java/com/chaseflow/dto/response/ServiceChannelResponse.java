package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ServiceChannelResponse {
    private UUID id;
    private UUID serviceId;
    private String channel;
    private List<ChaseSequenceResponse> sequences;
}
