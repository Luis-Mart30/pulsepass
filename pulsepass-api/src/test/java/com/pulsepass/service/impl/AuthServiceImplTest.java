package com.pulsepass.service.impl;

import com.pulsepass.domain.Role;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.UserRole;
import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.UserRoleRepository;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.SecurityPrincipal;
import com.pulsepass.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserCredentialRepository userCredentialRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void shouldRegisterUserWithHashedPasswordAndUserRole() {
        RegisterUserRequest request = createRegisterRequest();
        UserResponse response = createUserResponse();

        User user = new User();
        user.setUsername("andrea");
        user.setEmail("andrea@example.com");
        user.setActive(true);

        when(userService.register(request))
                .thenReturn(response);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.encode(request.password()))
                .thenReturn("$2a$10$encoded-password");

        UserResponse result = authService.register(request);

        ArgumentCaptor<UserCredential> credentialCaptor =
                ArgumentCaptor.forClass(UserCredential.class);

        ArgumentCaptor<UserRole> roleCaptor =
                ArgumentCaptor.forClass(UserRole.class);

        verify(passwordEncoder).encode(
                "UnaClaveSegura2026!"
        );

        verify(userCredentialRepository).save(
                credentialCaptor.capture()
        );

        verify(userRoleRepository).save(
                roleCaptor.capture()
        );

        UserCredential credential =
                credentialCaptor.getValue();

        UserRole role = roleCaptor.getValue();

        assertThat(result).isEqualTo(response);
        assertThat(credential.getUser()).isSameAs(user);
        assertThat(credential.getPasswordHash())
                .isEqualTo("$2a$10$encoded-password");
        assertThat(credential.getPasswordChangedAt())
                .isNotNull();
        assertThat(role.getUser()).isSameAs(user);
        assertThat(role.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void shouldNotCreateCredentialWhenRegisteredUserCannotBeLoaded() {
        RegisterUserRequest request = createRegisterRequest();
        UserResponse response = createUserResponse();

        when(userService.register(request))
                .thenReturn(response);

        when(userRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Registered user could not be loaded."
                );

        verify(passwordEncoder, never())
                .encode(any());

        verify(userCredentialRepository, never())
                .save(any());

        verify(userRoleRepository, never())
                .save(any());
    }

    @Test
    void shouldAuthenticateAndReturnJwt() {
        LoginRequest request = new LoginRequest(
                "andrea",
                "UnaClaveSegura2026!"
        );

        SecurityPrincipal principal = createPrincipal();

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(principal);

        when(jwtService.generateToken(principal))
                .thenReturn("jwt-token");

        when(jwtService.getExpirationSeconds())
                .thenReturn(900L);

        AuthResponse response = authService.login(request);

        ArgumentCaptor<UsernamePasswordAuthenticationToken>
                authenticationCaptor =
                ArgumentCaptor.forClass(
                        UsernamePasswordAuthenticationToken.class
                );

        verify(authenticationManager).authenticate(
                authenticationCaptor.capture()
        );

        UsernamePasswordAuthenticationToken authenticationToken =
                authenticationCaptor.getValue();

        assertThat(authenticationToken.getPrincipal())
                .isEqualTo("andrea");
        assertThat(authenticationToken.getCredentials())
                .isEqualTo("UnaClaveSegura2026!");

        assertThat(response.accessToken())
                .isEqualTo("jwt-token");
        assertThat(response.tokenType())
                .isEqualTo("Bearer");
        assertThat(response.expiresIn())
                .isEqualTo(900L);
    }

    @Test
    void shouldReturnGenericMessageWhenCredentialsAreInvalid() {
        LoginRequest request = new LoginRequest(
                "andrea",
                "ClaveIncorrecta"
        );

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException(
                        "Bad credentials"
                ));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials.");

        verifyNoInteractions(jwtService);
    }

    private RegisterUserRequest createRegisterRequest() {
        return new RegisterUserRequest(
                "andrea",
                "andrea@example.com",
                "UnaClaveSegura2026!",
                "Andrea",
                "Martinez",
                "3001234567",
                "Santa Marta",
                LocalDate.of(2000, 5, 10)
        );
    }

    private UserResponse createUserResponse() {
        return new UserResponse(
                1L,
                "andrea",
                "andrea@example.com",
                true,
                "Andrea",
                "Martinez",
                "3001234567",
                "Santa Marta",
                LocalDate.of(2000, 5, 10)
        );
    }

    private SecurityPrincipal createPrincipal() {
        return new SecurityPrincipal(
                1L,
                "andrea",
                "andrea@example.com",
                "$2a$10$encoded-password",
                true,
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER")
                )
        );
    }
}