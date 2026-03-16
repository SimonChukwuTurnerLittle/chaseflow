package com.chaseflow.service;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.Service;
import com.chaseflow.domain.enums.Temperature;

import java.util.ArrayList;
import java.util.List;

public final class ChaseDefaults {

    private ChaseDefaults() {}

    public record StepDef(int stepNumber, int delayDays, boolean isFinal) {}

    private static final List<StepDef> HOT_STEPS = List.of(
            new StepDef(1, 0, false),
            new StepDef(2, 2, false),
            new StepDef(3, 5, true)
    );

    private static final List<StepDef> MEDIUM_STEPS = List.of(
            new StepDef(1, 1, false),
            new StepDef(2, 7, false),
            new StepDef(3, 21, true)
    );

    private static final List<StepDef> COLD_STEPS = List.of(
            new StepDef(1, 3, false),
            new StepDef(2, 14, false),
            new StepDef(3, 30, true)
    );

    private static final List<StepDef> DORMANT_STEPS = List.of(
            new StepDef(1, 0, false),
            new StepDef(2, 14, false),
            new StepDef(3, 28, true)
    );

    public static List<ChaseSequence> seedSequences(Service service) {
        List<ChaseSequence> sequences = new ArrayList<>();
        sequences.addAll(createForTemperature(service, Temperature.HOT, HOT_STEPS));
        sequences.addAll(createForTemperature(service, Temperature.MEDIUM, MEDIUM_STEPS));
        sequences.addAll(createForTemperature(service, Temperature.COLD, COLD_STEPS));
        sequences.addAll(createForTemperature(service, Temperature.DORMANT, DORMANT_STEPS));
        return sequences;
    }

    private static List<ChaseSequence> createForTemperature(Service service, Temperature temp, List<StepDef> steps) {
        List<ChaseSequence> sequences = new ArrayList<>();
        for (StepDef step : steps) {
            sequences.add(ChaseSequence.builder()
                    .service(service)
                    .temperature(temp)
                    .stepNumber(step.stepNumber())
                    .delayDays(step.delayDays())
                    .isFinalStep(step.isFinal())
                    .stopOnReply(true)
                    .deleted(false)
                    .build());
        }
        return sequences;
    }
}
