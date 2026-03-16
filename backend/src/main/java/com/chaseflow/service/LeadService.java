package com.chaseflow.service;

import com.chaseflow.domain.ContactDetails;
import com.chaseflow.domain.Lead;
import com.chaseflow.domain.Note;
import com.chaseflow.domain.RelatedFile;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.LeadRequest;
import com.chaseflow.dto.request.NoteRequest;
import com.chaseflow.dto.response.*;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.repository.LeadRepository;
import com.chaseflow.repository.NoteRepository;
import com.chaseflow.repository.RelatedFileRepository;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final NoteRepository noteRepository;
    private final RelatedFileRepository relatedFileRepository;
    private final FileStorageService fileStorageService;
    private final TenantContext tenantContext;

    @Transactional
    public LeadResponse createLead(LeadRequest request) {
        assertWriteAccess();
        Long tenantId = tenantContext.currentTenantId();

        Lead lead = Lead.builder()
                .tenantId(tenantId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .source(request.getSource())
                .rating(request.getRating())
                .handler(request.getHandler())
                .build();

        ContactDetails contact = ContactDetails.builder()
                .lead(lead)
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .whatsapp(request.getWhatsapp())
                .addressLine(request.getAddressLine())
                .postcode(request.getPostcode())
                .city(request.getCity())
                .county(request.getCounty())
                .country(request.getCountry())
                .build();
        lead.setContactDetails(contact);

        lead = leadRepository.save(lead);
        return toResponse(lead);
    }

    public Page<LeadResponse> listLeads(String source, Pageable pageable) {
        Long tenantId = tenantContext.currentTenantId();
        Page<Lead> page;
        if (source != null && !source.isBlank()) {
            page = leadRepository.findByTenantIdAndSourceContainingIgnoreCase(tenantId, source, pageable);
        } else {
            page = leadRepository.findByTenantId(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    public LeadResponse getLead(Long id) {
        return toResponse(findLeadByIdAndTenant(id));
    }

    @Transactional
    public LeadResponse updateLead(Long id, LeadRequest request) {
        assertWriteAccess();
        Lead lead = findLeadByIdAndTenant(id);
        lead.setFirstName(request.getFirstName());
        lead.setLastName(request.getLastName());
        lead.setSource(request.getSource());
        lead.setRating(request.getRating());
        lead.setHandler(request.getHandler());

        ContactDetails contact = lead.getContactDetails();
        if (contact == null) {
            contact = new ContactDetails();
            contact.setLead(lead);
            lead.setContactDetails(contact);
        }
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setMobile(request.getMobile());
        contact.setWhatsapp(request.getWhatsapp());
        contact.setAddressLine(request.getAddressLine());
        contact.setPostcode(request.getPostcode());
        contact.setCity(request.getCity());
        contact.setCounty(request.getCounty());
        contact.setCountry(request.getCountry());

        lead = leadRepository.save(lead);
        return toResponse(lead);
    }

    @Transactional
    public void deleteLead(Long id) {
        assertWriteAccess();
        Lead lead = findLeadByIdAndTenant(id);
        lead.setDeleted(true);
        leadRepository.save(lead);
    }

    public List<NoteResponse> getNotes(Long leadId) {
        findLeadByIdAndTenant(leadId);
        return noteRepository.findByLeadIdOrderByDateAddedDesc(leadId).stream()
                .map(this::toNoteResponse)
                .toList();
    }

    @Transactional
    public NoteResponse addNote(Long leadId, NoteRequest request) {
        assertWriteAccess();
        Lead lead = findLeadByIdAndTenant(leadId);
        Note note = Note.builder()
                .lead(lead)
                .description(request.getDescription())
                .user(tenantContext.currentUsername())
                .build();
        note = noteRepository.save(note);
        return toNoteResponse(note);
    }

    public List<RelatedFileResponse> getFiles(Long leadId) {
        findLeadByIdAndTenant(leadId);
        return relatedFileRepository.findByLeadIdOrderByDateAddedDesc(leadId).stream()
                .map(this::toFileResponse)
                .toList();
    }

    @Transactional
    public RelatedFileResponse uploadFile(Long leadId, MultipartFile file, String description) {
        assertWriteAccess();
        Lead lead = findLeadByIdAndTenant(leadId);
        String s3Key = fileStorageService.upload(file, tenantContext.currentTenantId(), leadId);

        RelatedFile relatedFile = RelatedFile.builder()
                .lead(lead)
                .filename(file.getOriginalFilename())
                .description(description)
                .user(tenantContext.currentUsername())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .s3ObjectKey(s3Key)
                .build();
        relatedFile = relatedFileRepository.save(relatedFile);
        return toFileResponse(relatedFile);
    }

    private Lead findLeadByIdAndTenant(Long id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lead not found with id: " + id));
        if (!lead.getTenantId().equals(tenantContext.currentTenantId())) {
            throw new NotFoundException("Lead not found with id: " + id);
        }
        return lead;
    }

    private void assertWriteAccess() {
        UserRole role = tenantContext.currentUserRole();
        if (role == UserRole.EXPLORER) {
            throw new AccessDeniedException("Read-only access. Cannot modify leads.");
        }
    }

    private LeadResponse toResponse(Lead lead) {
        ContactDetailsResponse contactDto = null;
        if (lead.getContactDetails() != null) {
            ContactDetails c = lead.getContactDetails();
            contactDto = ContactDetailsResponse.builder()
                    .id(c.getId())
                    .email(c.getEmail())
                    .phone(c.getPhone())
                    .mobile(c.getMobile())
                    .whatsapp(c.getWhatsapp())
                    .addressLine(c.getAddressLine())
                    .postcode(c.getPostcode())
                    .city(c.getCity())
                    .county(c.getCounty())
                    .country(c.getCountry())
                    .build();
        }
        return LeadResponse.builder()
                .id(lead.getId())
                .firstName(lead.getFirstName())
                .lastName(lead.getLastName())
                .source(lead.getSource())
                .rating(lead.getRating())
                .handler(lead.getHandler())
                .dateCreated(lead.getDateCreated())
                .contactDetails(contactDto)
                .build();
    }

    private NoteResponse toNoteResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .description(note.getDescription())
                .user(note.getUser())
                .dateAdded(note.getDateAdded())
                .build();
    }

    private RelatedFileResponse toFileResponse(RelatedFile f) {
        return RelatedFileResponse.builder()
                .id(f.getId())
                .filename(f.getFilename())
                .description(f.getDescription())
                .dateAdded(f.getDateAdded())
                .user(f.getUser())
                .fileType(f.getFileType())
                .fileSize(f.getFileSize())
                .s3ObjectKey(f.getS3ObjectKey())
                .build();
    }
}
