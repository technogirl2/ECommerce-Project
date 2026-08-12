package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.exception.EmailSendException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.Body;
import software.amazon.awssdk.services.ses.model.Content;
import software.amazon.awssdk.services.ses.model.Destination;
import software.amazon.awssdk.services.ses.model.Message;
import software.amazon.awssdk.services.ses.model.SendEmailRequest;
import software.amazon.awssdk.services.ses.model.SesException;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final SesClient sesClient;

    @Value("${aws.ses.fromAddress}")
    private String fromAddress;

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        SendEmailRequest req = SendEmailRequest.builder()
                .source(fromAddress)
                .destination(Destination.builder().toAddresses(to).build())
                .message(Message.builder()
                        .subject(Content.builder().data(subject).build())
                        .body(Body.builder()
                                .html(Content.builder().data(htmlBody).build())
                                .build())
                        .build())
                .build();

        try {
            sesClient.sendEmail(req);
        } catch (SesException e) {
            throw new EmailSendException("Failed to send email via Amazon SES", e);
        }
    }
}
