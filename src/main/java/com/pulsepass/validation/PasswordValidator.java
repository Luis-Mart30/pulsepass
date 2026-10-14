package com.pulsepass.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.nio.charset.StandardCharsets;

public class PasswordValidator
        implements ConstraintValidator<ValidPassword, String> {

    private static final int MINIMUM_CHARACTERS = 12;
    private static final int MAXIMUM_BYTES = 72;

    @Override
    public boolean isValid(
            String password,
            ConstraintValidatorContext context
    ) {
        if (password == null) {
            return true;
        }

        int characterCount = password.codePointCount(
                0,
                password.length()
        );

        int byteCount = password.getBytes(
                StandardCharsets.UTF_8
        ).length;

        return characterCount >= MINIMUM_CHARACTERS
                && byteCount <= MAXIMUM_BYTES;
    }
}