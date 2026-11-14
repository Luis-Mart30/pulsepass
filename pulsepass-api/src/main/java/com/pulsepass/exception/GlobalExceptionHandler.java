package com.pulsepass.exception;

import com.pulsepass.dto.response.ErrorResponse;
import com.pulsepass.security.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException exception
    ) {
        Map<String, String> details =
                new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        details.putIfAbsent(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        ErrorResponse response = buildResponse(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                details
        );

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ErrorResponse> handleMalformedJson(
            HttpMessageNotReadableException exception
    ) {
        ErrorResponse response = buildResponse(
                HttpStatus.BAD_REQUEST,
                "Malformed JSON request",
                Map.of()
        );

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException exception,
            HttpServletRequest request
    ) {
        LOGGER.warn(
                "Authentication failed: "
                        + "requestId={}, method={}, path={}",
                requestId(),
                request.getMethod(),
                request.getRequestURI()
        );

        ErrorResponse response = buildResponse(
                HttpStatus.UNAUTHORIZED,
                "Invalid credentials.",
                Map.of()
        );

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException exception,
            HttpServletRequest request
    ) {
        LOGGER.warn(
                "Access denied: "
                        + "requestId={}, method={}, path={}",
                requestId(),
                request.getMethod(),
                request.getRequestURI()
        );

        ErrorResponse response = buildResponse(
                HttpStatus.FORBIDDEN,
                "You do not have permission "
                        + "to access this resource",
                Map.of()
        );

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    @ExceptionHandler(
            ResourceNotFoundException.class
    )
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException exception
    ) {
        ErrorResponse response = buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                Map.of()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(
            DuplicateResourceException.class
    )
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException exception
    ) {
        ErrorResponse response = buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                Map.of()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(
            BusinessRuleException exception
    ) {
        ErrorResponse response = buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                Map.of()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception exception
    ) {
        LOGGER.error(
                "Unexpected request failure: requestId={}",
                requestId()
        );

        ErrorResponse response = buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                Map.of()
        );

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(response);
    }

    private ErrorResponse buildResponse(
            HttpStatus status,
            String message,
            Map<String, String> details
    ) {
        return new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                details
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