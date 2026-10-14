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
import com.pulsepass.service.AuthService;
import com.pulsepass.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserService userService,
            UserRepository userRepository,
            UserCredentialRepository userCredentialRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.userCredentialRepository =
                userCredentialRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        UserResponse response = userService.register(request);

        User user = userRepository.findById(response.id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registered user could not be loaded."
                ));

        UserCredential credential = new UserCredential(
                user,
                passwordEncoder.encode(request.password()),
                LocalDateTime.now()
        );

        userCredentialRepository.save(credential);

        UserRole initialRole = new UserRole(
                user,
                Role.USER
        );

        userRoleRepository.save(initialRole);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.identifier(),
                                    request.password()
                            )
                    );

            SecurityPrincipal principal =
                    (SecurityPrincipal) authentication.getPrincipal();

            String accessToken =
                    jwtService.generateToken(principal);

            return new AuthResponse(
                    accessToken,
                    "Bearer",
                    jwtService.getExpirationSeconds()
            );
        } catch (AuthenticationException exception) {
            throw new BadCredentialsException(
                    "Invalid credentials."
            );
        }
    }
}