package com.chaseflow.service;

import com.chaseflow.domain.*;
import com.chaseflow.domain.enums.ChaseChannel;
import com.chaseflow.domain.enums.OpportunityStatus;
import com.chaseflow.domain.enums.TemplateType;
import com.chaseflow.integration.SesEmailClient;
import com.chaseflow.integration.TwilioSmsClient;
import com.chaseflow.integration.TwilioWhatsAppClient;
import com.chaseflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChaseSchedulerService {

    private final OpportunityRepository opportunityRepository;
    private final ServiceChannelRepository serviceChannelRepository;
    private final ChaseSequenceRepository chaseSequenceRepository;
    private final ActivityRepository activityRepository;
    private final TenantRepository tenantRepository;
    private final TenantConfigService tenantConfigService;
    private final AiDraftService aiDraftService;
    private final SesEmailClient sesEmailClient;
    private final TwilioSmsClient twilioSmsClient;
    private final TwilioWhatsAppClient twilioWhatsAppClient;

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void processDueOpportunities() {
        LocalDate today = LocalDate.now();
        List<Opportunity> dueOpportunities = opportunityRepository
                .findDueOpportunities(today, OpportunityStatus.ACTIVE);

        log.info("Chase scheduler: found {} due opportunities", dueOpportunities.size());

        for (Opportunity opp : dueOpportunities) {
            try {
                processOpportunity(opp);
            } catch (Exception e) {
                log.error("Failed to process opportunity {}: {}", opp.getId(), e.getMessage(), e);
            }
        }
    }

    private void processOpportunity(Opportunity opp) {
        if (opp.getService() == null) {
            log.warn("Opportunity {} has no service, skipping", opp.getId());
            return;
        }

        UUID serviceId = opp.getService().getId();
        ChaseChannel channel = opp.getChannel();
        int currentStep = opp.getCurrentStep();

        if (channel == null) {
            log.warn("Opportunity {} has no channel, skipping", opp.getId());
            return;
        }

        // Find the ServiceChannel for this opportunity's service + channel
        Optional<ServiceChannel> channelOpt = serviceChannelRepository
                .findByServiceIdAndChannel(serviceId, channel);

        if (channelOpt.isEmpty()) {
            log.warn("No service channel found for service={}, channel={}", serviceId, channel);
            return;
        }

        ServiceChannel serviceChannel = channelOpt.get();

        // Find matching chase sequence step
        Optional<ChaseSequence> seqOpt = chaseSequenceRepository
                .findByServiceChannelIdAndStepNumber(serviceChannel.getId(), currentStep);

        if (seqOpt.isEmpty()) {
            log.warn("No chase sequence found for serviceChannel={}, step={}",
                    serviceChannel.getId(), currentStep);
            return;
        }

        ChaseSequence seq = seqOpt.get();

        // Template comes directly from the chase sequence
        Template template = seq.getTemplate();
        if (template == null) {
            log.warn("No template linked to sequence step {} for serviceChannel {}",
                    currentStep, serviceChannel.getId());
            return;
        }

        ContactDetails contact = opp.getLead().getContactDetails();
        if (contact == null) {
            log.warn("No contact details for lead {} on opportunity {}", opp.getLead().getId(), opp.getId());
            return;
        }

        List<Activity> activityHistory = activityRepository
                .findByOpportunityIdOrderByDateAddedDesc(opp.getId());

        if (seq.getUseAiPersonalisation()) {
            // Generate AI draft — will be reviewed by user
            TemplateType templateType = toTemplateType(channel);
            AiDraft draft = aiDraftService.generateDraft(opp, template, templateType,
                    activityHistory, contact, opp.getServiceName(), currentStep,
                    seq.getAiPersonalisationGuidance(), opp.getAiGuidanceContext());
            log.info("AI draft {} created for opportunity {}", draft.getId(), opp.getId());

            // Notify assigned user via email
            notifyUserOfPendingDraft(opp, draft);
        } else {
            // Resolve tokens and send immediately
            Tenant tenant = tenantRepository.findById(opp.getTenantId()).orElse(null);
            String resolvedContent = TemplateTokenResolver.resolve(
                    template.getTemplateContent(), opp.getLead(), contact,
                    opp.getService(), opp, tenant, activityHistory);

            sendMessage(channel, contact, template.getSubject(), resolvedContent);

            // Log activity
            Activity activity = Activity.builder()
                    .opportunity(opp)
                    .description("Auto-sent " + channel.name().toLowerCase() + " (step " + currentStep + ")")
                    .templateType(toTemplateType(channel))
                    .contentSent(resolvedContent)
                    .aiGenerated(false)
                    .user("system")
                    .build();
            activityRepository.save(activity);
        }

        // Advance step or close
        if (seq.getIsFinalStep()) {
            opp.setStatus(OpportunityStatus.COMPLETED);
            opp.setDateCompleted(LocalDateTime.now());
            opp.setNextChaseDate(null);

            // Handle recurrence
            if (opp.getService().getRecurrenceDays() != null) {
                createRecurrence(opp);
            }
        } else {
            opp.setCurrentStep(currentStep + 1);
            // Next chase date from TenantConfig delay days
            LocalDate nextDate = tenantConfigService.getNextChaseDate(
                    opp.getTenantId(), opp.getTemperature());
            opp.setNextChaseDate(nextDate);
        }

        opportunityRepository.save(opp);
    }

    private TemplateType toTemplateType(ChaseChannel channel) {
        return switch (channel) {
            case EMAIL -> TemplateType.EMAIL;
            case SMS -> TemplateType.SMS;
            case WHATSAPP -> TemplateType.WHATSAPP;
        };
    }

    private void sendMessage(ChaseChannel channel, ContactDetails contact, String subject, String content) {
        switch (channel) {
            case EMAIL -> {
                if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                    sesEmailClient.sendEmail(contact.getEmail(), subject, content);
                }
            }
            case SMS -> {
                String phone = contact.getMobile() != null ? contact.getMobile() : contact.getPhone();
                if (phone != null && !phone.isBlank()) {
                    twilioSmsClient.sendSms(phone, content);
                }
            }
            case WHATSAPP -> {
                if (contact.getWhatsapp() != null && !contact.getWhatsapp().isBlank()) {
                    twilioWhatsAppClient.sendWhatsApp(contact.getWhatsapp(), content);
                }
            }
        }
    }

    private void notifyUserOfPendingDraft(Opportunity opp, AiDraft draft) {
        try {
            String handler = opp.getLead().getHandler();
            if (handler != null && !handler.isBlank() && handler.contains("@")) {
                sesEmailClient.sendEmail(handler,
                        "ChaseFlow: Draft ready for review",
                        "<p>A new AI-generated draft is ready for review for " +
                                opp.getLead().getFirstName() + " — " + opp.getServiceName() + ".</p>" +
                                "<p>Please log in to ChaseFlow to review and approve.</p>");
            }
        } catch (Exception e) {
            log.warn("Failed to send draft notification for opportunity {}: {}", opp.getId(), e.getMessage());
        }
    }

    private void createRecurrence(Opportunity opp) {
        Opportunity recurrence = Opportunity.builder()
                .tenantId(opp.getTenantId())
                .lead(opp.getLead())
                .service(opp.getService())
                .serviceName(opp.getServiceName())
                .channel(opp.getChannel())
                .temperature(opp.getTemperature())
                .opportunityType(opp.getOpportunityType())
                .aiGuidanceContext(opp.getAiGuidanceContext())
                .currentStep(1)
                .status(OpportunityStatus.ACTIVE)
                .nextChaseDate(LocalDate.now().plusDays(opp.getService().getRecurrenceDays()))
                .build();
        opportunityRepository.save(recurrence);
        log.info("Recurrence opportunity created for lead {} service {}",
                opp.getLead().getId(), opp.getServiceName());
    }
}
