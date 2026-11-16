package com.pulsepass.security;

import com.pulsepass.dto.response.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class RestAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    RestAuthenticationEntryPoint.class
            );

    private final JsonMapper jsonMapper;

    public RestAuthenticationEntryPoint(
            JsonMapper jsonMapper
    ) {
        this.jsonMapper = jsonMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        LOGGER.warn(
                "Authentication required: "
                        + "requestId={}, method={}, path={}",
                requestId(),
                request.getMethod(),
                request.getRequestURI()
        );

        ErrorResponse errorResponse =
                new ErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.UNAUTHORIZED.value(),
                        HttpStatus.UNAUTHORIZED
                                .getReasonPhrase(),
                        "Authentication is required "
                                + "to access this resource",
                        Map.of()
                );

        response.setStatus(
                HttpStatus.UNAUTHORIZED.value()
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        response.setCharacterEncoding(
                StandardCharsets.UTF_8.name()
        );

        jsonMapper.writeValue(
                response.getOutputStream(),
                errorResponse
        );
    }

    private String requestId() {
        String requestId = MDC.get(
                RequestIdFilter.REQUEST_ID_MDC_KEY
        );

        return requestId == null
                ? "unavailable"
                : requestId;
    }
}