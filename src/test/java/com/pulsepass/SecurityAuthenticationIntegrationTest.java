package com.pulsepass;

import com.pulsepass.domain.Role;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.UserRole;
import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.UserRoleRepository;
import com.pulsepass.security.JwtService;
import com.pulsepass.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class SecurityAuthenticationIntegrationTest {

    private static final String RAW_PASSWORD =
            "UnaClaveSegura2026!";

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCredentialRepository
            userCredentialRepository;

    @MockitoSpyBean
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Test
    void registrationPersistsBcryptCredentialAndUserRole() {
        RegisterUserRequest request =
                createRegisterRequest(
                        "integration-register-user",
                        "integration-register@example.com"
                );

        UserResponse response =
                authService.register(request);

        UserCredential credential =
                userCredentialRepository
                        .findById(response.id())
                        .orElseThrow();

        assertThat(credential.getPasswordHash())
                .isNotEqualTo(RAW_PASSWORD);

        assertThat(
                passwordEncoder.matches(
                        RAW_PASSWORD,
                        credential.getPasswordHash()
                )
        ).isTrue();

        assertThat(
                userRoleRepository.findByUser_Id(
                        response.id()
                )
        )
                .extracting(UserRole::getRole)
                .containsExactly(Role.USER);
    }

    @Test
    void loginAgainstPersistedUserReturnsValidJwt() {
        RegisterUserRequest request =
                createRegisterRequest(
                        "integration-login-user",
                        "integration-login@example.com"
                );

        UserResponse registeredUser =
                authService.register(request);

        AuthResponse response = authService.login(
                new LoginRequest(
                        "integration-login-user",
                        RAW_PASSWORD
                )
        );

        assertThat(response.accessToken())
                .isNotBlank();

        assertThat(response.tokenType())
                .isEqualTo("Bearer");

        assertThat(response.expiresIn())
                .isEqualTo(900L);

        assertThat(
                jwtService.extractUserId(
                        response.accessToken()
                )
        ).isEqualTo(registeredUser.id());
    }

    @Test
    void persistedUserRejectsIncorrectPassword() {
        RegisterUserRequest request =
                createRegisterRequest(
                        "integration-invalid-password",
                        "integration-invalid@example.com"
                );

        authService.register(request);

        LoginRequest loginRequest =
                new LoginRequest(
                        "integration-invalid-password",
                        "ClaveTotalmenteIncorrecta"
                );

        assertThatThrownBy(
                () -> authService.login(loginRequest)
        )
                .isInstanceOf(
                        BadCredentialsException.class
                )
                .hasMessage(
                        "Invalid credentials."
                );
    }

    @Test
    void registrationRollsBackWhenRoleCannotBeSaved() {
        String username =
                "integration-rollback-user";

        String email =
                "integration-rollback@example.com";

        doThrow(
                new DataIntegrityViolationException(
                        "Forced role persistence failure"
                )
        )
                .when(userRoleRepository)
                .save(any(UserRole.class));

        RegisterUserRequest request =
                createRegisterRequest(
                        username,
                        email
                );

        assertThatThrownBy(
                () -> authService.register(request)
        ).isInstanceOf(
                DataIntegrityViolationException.class
        );

        assertThat(
                userRepository.findByUsername(username)
        ).isEmpty();

        assertThat(
                userRepository.findByEmailIgnoreCase(email)
        ).isEmpty();

        assertThat(
                userCredentialRepository
                        .findByUser_Username(username)
        ).isEmpty();
    }

    private RegisterUserRequest createRegisterRequest(
            String username,
            String email
    ) {
        return new RegisterUserRequest(
                username,
                email,
                RAW_PASSWORD,
                "Andrea",
                "Martinez",
                "3001234567",
                "Santa Marta",
                LocalDate.of(2000, 5, 10)
        );
    }
}