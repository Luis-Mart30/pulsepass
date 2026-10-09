package com.pulsepass.service.impl;

import com.pulsepass.domain.User;
import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void shouldRegisterValidUser() {
        RegisterUserRequest request = createRequest(
                LocalDate.of(2001, 5, 15)
        );
        UserResponse response = createResponse();

        when(userRepository.existsByUsername(
                request.username()
        )).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(
                request.email()
        )).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toResponse(any(User.class)))
                .thenReturn(response);

        UserResponse result = userService.register(request);

        assertThat(result).isEqualTo(response);

        verify(userRepository).save(
                org.mockito.ArgumentMatchers.argThat(user ->
                        user.isActive()
                                && user.getProfile() != null
                                && user.getProfile().getUser() == user
                                && user.getProfile().getFirstName()
                                .equals("Andrea")
                )
        );
    }

    @Test
    void shouldRejectDuplicatedUsername() {
        RegisterUserRequest request = createRequest(
                LocalDate.of(2001, 5, 15)
        );

        when(userRepository.existsByUsername(
                request.username()
        )).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Username already exists.");

        verify(userRepository, never())
                .existsByEmailIgnoreCase(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldRejectDuplicatedEmailIgnoringCase() {
        RegisterUserRequest request = createRequest(
                LocalDate.of(2001, 5, 15)
        );

        when(userRepository.existsByUsername(
                request.username()
        )).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(
                request.email()
        )).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Email already exists.");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldRejectFutureBirthDate() {
        RegisterUserRequest request = createRequest(
                LocalDate.now().plusDays(1)
        );

        when(userRepository.existsByUsername(
                request.username()
        )).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(
                request.email()
        )).thenReturn(false);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage(
                        "Birth date cannot be in the future."
                );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldFindUserByEmail() {
        User user = createUser();
        UserResponse response = createResponse();

        when(userRepository.findByEmailIgnoreCase(
                "andrea@email.com"
        )).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(response);

        UserResponse result =
                userService.findByEmail("andrea@email.com");

        assertThat(result).isEqualTo(response);
        verify(userMapper).toResponse(user);
    }

    @Test
    void shouldFindUserByUsername() {
        User user = createUser();
        UserResponse response = createResponse();

        when(userRepository.findByUsername("andrea"))
                .thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(response);

        UserResponse result =
                userService.findByUsername("andrea");

        assertThat(result).isEqualTo(response);
        verify(userMapper).toResponse(user);
    }

    @Test
    void shouldThrowWhenUserEmailDoesNotExist() {
        when(userRepository.findByEmailIgnoreCase(
                "missing@email.com"
        )).thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.findByEmail(
                        "missing@email.com"
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User not found: missing@email.com"
                );

        verify(userMapper, never())
                .toResponse(any(User.class));
    }

    private RegisterUserRequest createRequest(
            LocalDate birthDate
    ) {
        return new RegisterUserRequest(
                "andrea",
                "andrea@email.com",
                "Andrea",
                "Sierra",
                "3001234567",
                "Santa Marta",
                birthDate
        );
    }

    private User createUser() {
        User user = new User();
        user.setUsername("andrea");
        user.setEmail("andrea@email.com");
        user.setActive(true);
        return user;
    }

    private UserResponse createResponse() {
        return new UserResponse(
                null,
                "andrea",
                "andrea@email.com",
                true,
                "Andrea",
                "Sierra",
                "3001234567",
                "Santa Marta",
                LocalDate.of(2001, 5, 15)
        );
    }
}