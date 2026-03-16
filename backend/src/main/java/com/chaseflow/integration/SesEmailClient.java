package com.chaseflow.integration;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Component
@RequiredArgsConstructor
public class SesEmailClient {

    private final SesClient sesClient;

    @Value("${app.aws.ses.from-email}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String htmlBody) {
        SendEmailRequest request = SendEmailRequest.builder()
                .source(fromEmail)
                .destination(Destination.builder().toAddresses(to).build())
                .message(Message.builder()
                        .subject(Content.builder().data(subject).charset("UTF-8").build())
                        .body(Body.builder()
                                .html(Content.builder().data(htmlBody).charset("UTF-8").build())
                                .build())
                        .build())
                .build();
        sesClient.sendEmail(request);
    }
}
