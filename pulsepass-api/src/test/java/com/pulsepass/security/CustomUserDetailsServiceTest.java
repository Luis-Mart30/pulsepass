package com.pulsepass.security;

import com.pulsepass.domain.Role;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.UserRole;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserCredentialRepository
            userCredentialRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void shouldLoadUserByUsernameWithCurrentRoles() {
        User user = createUser(true);

        UserCredential credential =
                createCredential(user);

        UserRole userRole = mock(UserRole.class);
        UserRole staffRole = mock(UserRole.class);

        when(userRole.getRole()).thenReturn(Role.USER);
        when(staffRole.getRole()).thenReturn(Role.STAFF);

        when(userCredentialRepository
                .findByUser_Username("andrea"))
                .thenReturn(Optional.of(credential));

        when(userRoleRepository.findByUser_Id(1L))
                .thenReturn(List.of(userRole, staffRole));

        SecurityPrincipal principal =
                (SecurityPrincipal)
                        userDetailsService
                                .loadUserByUsername(
                                        "andrea"
                                );

        assertThat(principal.getUserId()).isEqualTo(1L);
        assertThat(principal.getUsername())
                .isEqualTo("andrea");
        assertThat(principal.getEmail())
                .isEqualTo("andrea@example.com");
        assertThat(principal.getPassword())
                .isEqualTo("$2a$10$encoded-password");
        assertThat(principal.isEnabled()).isTrue();

        assertThat(principal.getAuthorities())
                .extracting("authority")
                .containsExactlyInAnyOrder(
                        "ROLE_USER",
                        "ROLE_STAFF"
                );
    }

    @Test
    void shouldLoadUserByEmail() {
        User user = createUser(true);
        UserCredential credential =
                createCredential(user);

        UserRole userRole = mock(UserRole.class);
        when(userRole.getRole()).thenReturn(Role.USER);

        when(userCredentialRepository
                .findByUser_Username(
                        "andrea@example.com"
                ))
                .thenReturn(Optional.empty());

        when(userCredentialRepository
                .findByUser_EmailIgnoreCase(
                        "andrea@example.com"
                ))
                .thenReturn(Optional.of(credential));

        when(userRoleRepository.findByUser_Id(1L))
                .thenReturn(List.of(userRole));

        SecurityPrincipal principal =
                (SecurityPrincipal)
                        userDetailsService
                                .loadUserByUsername(
                                        "andrea@example.com"
                                );

        assertThat(principal.getUserId()).isEqualTo(1L);
        assertThat(principal.getEmail())
                .isEqualTo("andrea@example.com");
        assertThat(principal.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    @Test
    void shouldRepresentInactiveUserAsDisabled() {
        User user = createUser(false);
        UserCredential credential =
                createCredential(user);

        when(userCredentialRepository
                .findById(1L))
                .thenReturn(Optional.of(credential));

        when(userRoleRepository.findByUser_Id(1L))
                .thenReturn(List.of());

        SecurityPrincipal principal =
                userDetailsService.loadByUserId(1L);

        assertThat(principal.isEnabled()).isFalse();
    }

    @Test
    void shouldRejectUnknownIdentifier() {
        when(userCredentialRepository
                .findByUser_Username("unknown"))
                .thenReturn(Optional.empty());

        when(userCredentialRepository
                .findByUser_EmailIgnoreCase("unknown"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userDetailsService.loadUserByUsername(
                        "unknown"
                ))
                .isInstanceOf(
                        UsernameNotFoundException.class
                )
                .hasMessage("Invalid credentials.");
    }

    @Test
    void shouldRejectUnknownUserId() {
        when(userCredentialRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userDetailsService.loadByUserId(999L)
        )
                .isInstanceOf(
                        UsernameNotFoundException.class
                )
                .hasMessage("Invalid credentials.");
    }

    private User createUser(boolean active) {
        User user = mock(User.class);

        when(user.getId()).thenReturn(1L);
        when(user.getUsername()).thenReturn("andrea");
        when(user.getEmail())
                .thenReturn("andrea@example.com");
        when(user.isActive()).thenReturn(active);

        return user;
    }

    private UserCredential createCredential(User user) {
        return new UserCredential(
                user,
                "$2a$10$encoded-password",
                LocalDateTime.now()
        );
    }
}