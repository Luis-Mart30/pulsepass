package com.pulsepass.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(
        prefix = "pulsepass.security.cors"
)
public record CorsProperties(
        List<String> allowedOrigins
) {

    public CorsProperties {
        if (allowedOrigins == null
                || allowedOrigins.isEmpty()) {
            throw new IllegalStateException(
                    "At least one CORS origin "
                            + "must be configured"
            );
        }

        allowedOrigins = List.copyOf(
                allowedOrigins
        );
    }
}