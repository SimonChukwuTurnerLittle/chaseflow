package com.chaseflow.service;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.ServiceChannel;

import java.util.ArrayList;
import java.util.List;

public final class ChaseDefaults {

    private ChaseDefaults() {}

    private static final int DEFAULT_STEPS = 3;

    /**
     * Seed default chase sequence steps for a ServiceChannel.
     * Creates 3 steps: step 1, 2, 3 — with step 3 marked as final.
     */
    public static List<ChaseSequence> seedSequences(ServiceChannel serviceChannel) {
        List<ChaseSequence> sequences = new ArrayList<>();
        for (int i = 1; i <= DEFAULT_STEPS; i++) {
            sequences.add(ChaseSequence.builder()
                    .serviceChannel(serviceChannel)
                    .stepNumber(i)
                    .isFinalStep(i == DEFAULT_STEPS)
                    .stopOnReply(true)
                    .deleted(false)
                    .build());
        }
        return sequences;
    }
}
