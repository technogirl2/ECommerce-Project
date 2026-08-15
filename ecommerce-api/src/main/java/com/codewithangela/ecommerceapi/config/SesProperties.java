package com.codewithangela.ecommerceapi.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws.ses")
@Getter
@Setter
public class SesProperties {

    private String region;
    private String accessKey;
    private String secretKey;
    private String fromAddress;
}
