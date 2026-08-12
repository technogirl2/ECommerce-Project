package com.codewithangela.ecommerceapi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;

@Configuration
@EnableConfigurationProperties(SesProperties.class)
@RequiredArgsConstructor
public class SesConfig {

    private final SesProperties sesProperties;

    @Bean
    public SesClient sesClient() {
        return SesClient.builder()
                .region(Region.of(sesProperties.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                sesProperties.getAccessKey(),
                                sesProperties.getSecretKey())))
                .build();
    }

}
