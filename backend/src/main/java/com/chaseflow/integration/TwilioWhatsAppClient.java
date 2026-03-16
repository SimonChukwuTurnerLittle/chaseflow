package com.chaseflow.integration;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class TwilioWhatsAppClient {

    @Value("${app.twilio.from-whatsapp}")
    private String fromWhatsApp;

    public void sendWhatsApp(String to, String body) {
        Message.creator(
                new PhoneNumber("whatsapp:" + to),
                new PhoneNumber("whatsapp:" + fromWhatsApp),
                body
        ).create();
    }
}
