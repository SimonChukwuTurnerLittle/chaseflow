package com.chaseflow.service;

import com.chaseflow.domain.*;
import com.chaseflow.domain.enums.DraftStatus;
import com.chaseflow.domain.enums.TemplateType;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.AiDraftUpdateRequest;
import com.chaseflow.dto.response.AiDraftResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.exception.ValidationException;
import com.chaseflow.integration.ClaudeApiClient;
import com.chaseflow.integration.SesEmailClient;
import com.chaseflow.integration.TwilioSmsClient;
import com.chaseflow.integration.TwilioWhatsAppClient;
import com.chaseflow.repository.ActivityRepository;
import com.chaseflow.repository.AiDraftRepository;
import com.chaseflow.repository.OpportunityRepository;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiDraftService {

    private final AiDraftRepository aiDraftRepository;
    private final OpportunityRepository opportunityRepository;
    private final ActivityRepository activityRepository;
    private final ClaudeApiClient claudeApiClient;
    private final SesEmailClient sesEmailClient;
    private final TwilioSmsClient twilioSmsClient;
    private final TwilioWhatsAppClient twilioWhatsAppClient;
    private final TenantContext tenantContext;

    public Page<AiDraftResponse> listPendingDrafts(Pageable pageable) {
        UUID tenantId = tenantContext.currentTenantId();
        return aiDraftRepository.findByTenantIdAndStatus(tenantId, DraftStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    public AiDraftResponse getDraft(UUID id) {
        AiDraft draft = findDraftById(id);
        return toResponse(draft);
    }

    @Transactional
    public AiDraftResponse updateDraft(UUID id, AiDraftUpdateRequest request) {
        assertSalesHandlerOrAbove();
        AiDraft draft = findDraftById(id);
        if (draft.getStatus() != DraftStatus.PENDING) {
            throw new ValidationException("Only PENDING drafts can be edited");
        }
        draft.setSubject(request.getSubject());
        draft.setContent(request.getContent());
        draft = aiDraftRepository.save(draft);
        return toResponse(draft);
    }

    @Transactional
    public AiDraftResponse approveDraft(UUID id) {
        assertSalesHandlerOrAbove();
        AiDraft draft = findDraftById(id);
        if (draft.getStatus() != DraftStatus.PENDING) {
            throw new ValidationException("Only PENDING drafts can be approved");
        }

        // Send the message
        Opportunity opp = draft.getOpportunity();
        ContactDetails contact = opp.getLead().getContactDetails();
        sendMessage(draft, contact);

        // Update draft status
        draft.setStatus(DraftStatus.SENT);
        draft.setApprovedBy(tenantContext.currentUsername());
        draft.setApprovedAt(LocalDateTime.now());
        draft = aiDraftRepository.save(draft);

        // Log activity
        Activity activity = Activity.builder()
                .opportunity(opp)
                .description("Sent " + draft.getTemplateType().name().toLowerCase() + " (AI-generated, approved)")
                .templateType(draft.getTemplateType())
                .contentSent(draft.getContent())
                .aiGenerated(true)
                .aiDraftId(draft.getId())
                .user(tenantContext.currentUsername())
                .build();
        activityRepository.save(activity);

        return toResponse(draft);
    }

    @Transactional
    public AiDraftResponse rejectDraft(UUID id) {
        assertSalesHandlerOrAbove();
        AiDraft draft = findDraftById(id);
        if (draft.getStatus() != DraftStatus.PENDING) {
            throw new ValidationException("Only PENDING drafts can be rejected");
        }
        draft.setStatus(DraftStatus.REJECTED);
        draft = aiDraftRepository.save(draft);
        return toResponse(draft);
    }

    @Transactional
    public AiDraft generateDraft(Opportunity opportunity, Template template, TemplateType channel,
                                  List<Activity> activityHistory, ContactDetails contact,
                                  String serviceName, int stepNumber) {
        ClaudeApiClient.AiGeneratedContent generated = claudeApiClient.generateChaseMessage(
                contact.getLead().getFirstName(),
                serviceName,
                opportunity.getTemperature().name(),
                stepNumber,
                template.getAiPromptHint(),
                channel,
                activityHistory
        );

        AiDraft draft = AiDraft.builder()
                .opportunity(opportunity)
                .templateType(channel)
                .subject(generated.subject())
                .content(generated.content())
                .status(DraftStatus.PENDING)
                .build();
        return aiDraftRepository.save(draft);
    }

    private void sendMessage(AiDraft draft, ContactDetails contact) {
        switch (draft.getTemplateType()) {
            case EMAIL -> {
                if (contact.getEmail() == null || contact.getEmail().isBlank()) {
                    throw new ValidationException("Contact has no email address");
                }
                sesEmailClient.sendEmail(contact.getEmail(), draft.getSubject(), draft.getContent());
            }
            case SMS -> {
                String phone = contact.getMobile() != null ? contact.getMobile() : contact.getPhone();
                if (phone == null || phone.isBlank()) {
                    throw new ValidationException("Contact has no phone number for SMS");
                }
                twilioSmsClient.sendSms(phone, draft.getContent());
            }
            case WHATSAPP -> {
                if (contact.getWhatsapp() == null || contact.getWhatsapp().isBlank()) {
                    throw new ValidationException("Contact has no WhatsApp number");
                }
                twilioWhatsAppClient.sendWhatsApp(contact.getWhatsapp(), draft.getContent());
            }
        }
    }

    private AiDraft findDraftById(UUID id) {
        AiDraft draft = aiDraftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Draft not found with id: " + id));
        if (!draft.getOpportunity().getTenantId().equals(tenantContext.currentTenantId())) {
            throw new NotFoundException("Draft not found with id: " + id);
        }
        return draft;
    }

    private void assertSalesHandlerOrAbove() {
        UserRole role = tenantContext.currentUserRole();
        if (role == UserRole.EXPLORER || role == UserRole.SALES_USER) {
            throw new AccessDeniedException("Insufficient permissions to manage drafts");
        }
    }

    private AiDraftResponse toResponse(AiDraft d) {
        Opportunity opp = d.getOpportunity();
        return AiDraftResponse.builder()
                .id(d.getId())
                .opportunityId(opp.getId())
                .leadName(opp.getLead().getFirstName() + " " +
                        (opp.getLead().getLastName() != null ? opp.getLead().getLastName() : ""))
                .serviceName(opp.getServiceName())
                .templateType(d.getTemplateType().name())
                .subject(d.getSubject())
                .content(d.getContent())
                .status(d.getStatus().name())
                .approvedBy(d.getApprovedBy())
                .approvedAt(d.getApprovedAt())
                .timeCreated(d.getTimeCreated())
                .build();
    }
}
