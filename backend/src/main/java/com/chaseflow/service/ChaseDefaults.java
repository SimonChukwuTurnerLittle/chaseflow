package com.chaseflow.service;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.Service;
import com.chaseflow.domain.Template;
import com.chaseflow.domain.enums.ContentFormat;
import com.chaseflow.domain.enums.Temperature;
import com.chaseflow.domain.enums.TemplateType;

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
            ChaseSequence seq = ChaseSequence.builder()
                    .service(service)
                    .temperature(temp)
                    .stepNumber(step.stepNumber())
                    .delayDays(step.delayDays())
                    .isFinalStep(step.isFinal())
                    .stopOnReply(true)
                    .deleted(false)
                    .build();

            List<Template> templates = new ArrayList<>();
            for (TemplateType channel : TemplateType.values()) {
                templates.add(createTemplate(service, seq, temp, step, channel));
            }
            seq.setTemplates(templates);
            sequences.add(seq);
        }
        return sequences;
    }

    private static Template createTemplate(Service service, ChaseSequence seq, Temperature temp,
                                           StepDef step, TemplateType channel) {
        String tempLabel = temp.name().toLowerCase();
        String stepLabel = step.isFinal() ? "final follow-up" : "follow-up " + step.stepNumber();
        boolean isEmail = channel == TemplateType.EMAIL;

        String subject = isEmail
                ? "Following up — " + service.getServiceName() + " (" + stepLabel + ")"
                : null;

        String body;
        ContentFormat format;
        if (isEmail) {
            format = ContentFormat.HTML;
            body = "<p>Hi {{contact.first_name}},</p>" +
                   "<p>I wanted to follow up regarding " + service.getServiceName() + ".</p>" +
                   "<p>Best regards,<br/>{{business.name}}</p>";
        } else {
            format = ContentFormat.TEXT;
            body = "Hi {{contact.first_name}}, just following up on " + service.getServiceName() + ". " +
                   "Let us know if you have any questions. — {{business.name}}";
        }

        String hint = "Generate a " + tempLabel + " " + stepLabel + " message for " +
                      channel.name().toLowerCase() + " about " + service.getServiceName() + ". " +
                      "Tone should be " + getTone(temp) + ".";

        return Template.builder()
                .service(service)
                .chaseSequence(seq)
                .templateTitle(temp.name() + " Step " + step.stepNumber() + " — " + channel.name())
                .templateDescription(stepLabel + " via " + channel.name().toLowerCase())
                .templateType(channel)
                .subject(subject)
                .templateContent(body)
                .templateContentFormat(format)
                .aiPromptHint(hint)
                .useAi(true)
                .version(1)
                .deleted(false)
                .build();
    }

    private static String getTone(Temperature temp) {
        return switch (temp) {
            case HOT -> "urgent and enthusiastic";
            case MEDIUM -> "friendly and professional";
            case COLD -> "warm and re-engaging";
            case DORMANT -> "gentle and exploratory";
        };
    }
}
