package com.chaseflow.service;

import com.chaseflow.domain.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

public final class TemplateTokenResolver {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private TemplateTokenResolver() {}

    public static String resolve(String content, Lead lead, ContactDetails contact,
                                  Service service, Opportunity opportunity,
                                  Tenant tenant, List<Activity> activities) {
        if (content == null) return null;

        String result = content;
        if (contact != null) {
            result = result.replace("{{contact.first_name}}", safe(lead.getFirstName()));
            result = result.replace("{{contact.last_name}}", safe(lead.getLastName()));
            result = result.replace("{{contact.email}}", safe(contact.getEmail()));
            result = result.replace("{{contact.phone}}", safe(contact.getPhone()));
            result = result.replace("{{contact.company}}", "");
        }
        if (service != null) {
            result = result.replace("{{service.name}}", safe(service.getServiceName()));
        }
        if (opportunity != null) {
            result = result.replace("{{opportunity.due_date}}",
                    opportunity.getNextChaseDate() != null
                            ? opportunity.getNextChaseDate().format(DATE_FMT) : "");
            result = result.replace("{{step_number}}", String.valueOf(opportunity.getCurrentStep()));
        }
        if (tenant != null) {
            result = result.replace("{{business.name}}", safe(tenant.getName()));
            result = result.replace("{{business.phone}}", "");
            result = result.replace("{{business.email}}", "");
        }
        if (activities != null && !activities.isEmpty()) {
            Activity last = activities.get(0);
            result = result.replace("{{last_activity_date}}",
                    last.getDateAdded() != null ? last.getDateAdded().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
        } else {
            result = result.replace("{{last_activity_date}}", "");
        }
        return result;
    }

    private static String safe(String value) {
        return value != null ? value : "";
    }
}
