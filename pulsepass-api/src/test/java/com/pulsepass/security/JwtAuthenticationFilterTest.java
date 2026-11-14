package com.pulsepass.security;

import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.FilterChain;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        jwtAuthenticationFilter = new JwtAuthenticationFilter(
                jwtService,
                userDetailsService
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldContinueWithoutAuthenticationWhenBearerHeaderIsMissing()
            throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        jwtAuthenticationFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        assertThat(
                SecurityContextHolder.getContext()
                        .getAuthentication()
        ).isNull();

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void shouldAuthenticateWhenBearerTokenIsValid()
            throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer valid-token"
        );

        SecurityPrincipal principal = createPrincipal(1L);

        when(jwtService.extractUserId("valid-token"))
                .thenReturn(1L);

        when(userDetailsService.loadByUserId(1L))
                .thenReturn(principal);

        when(jwtService.isTokenValid(
                "valid-token",
                principal
        )).thenReturn(true);

        jwtAuthenticationFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        var authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        assertThat(authentication).isNotNull();
        assertThat(authentication.isAuthenticated()).isTrue();
        assertThat(authentication.getPrincipal())
                .isSameAs(principal);

        verify(jwtService).extractUserId("valid-token");
        verify(userDetailsService).loadByUserId(1L);
        verify(jwtService).isTokenValid(
                "valid-token",
                principal
        );
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldContinueWithoutAuthenticationWhenTokenIsInvalid()
            throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer invalid-token"
        );

        when(jwtService.extractUserId("invalid-token"))
                .thenThrow(
                        new MalformedJwtException(
                                "Invalid token"
                        )
                );

        jwtAuthenticationFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        assertThat(
                SecurityContextHolder.getContext()
                        .getAuthentication()
        ).isNull();

        verify(userDetailsService, never())
                .loadByUserId(1L);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldRejectRequestAuthenticationWhenAuthorizationHeaderIsDuplicated()
            throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer first-token"
        );

        request.addHeader(
                "Authorization",
                "Bearer second-token"
        );

        jwtAuthenticationFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        assertThat(
                SecurityContextHolder.getContext()
                        .getAuthentication()
        ).isNull();

        verifyNoInteractions(jwtService, userDetailsService);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldNotOverwriteExistingAuthentication()
            throws Exception {
        MockHttpServletRequest request =
                new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer another-token"
        );

        SecurityPrincipal principal = createPrincipal(9L);

        var existingAuthentication =
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );

        SecurityContextHolder.getContext()
                .setAuthentication(existingAuthentication);

        jwtAuthenticationFilter.doFilterInternal(
                request,
                response,
                filterChain
        );

        assertThat(
                SecurityContextHolder.getContext()
                        .getAuthentication()
        ).isSameAs(existingAuthentication);

        verifyNoInteractions(jwtService, userDetailsService);
        verify(filterChain).doFilter(request, response);
    }

    private SecurityPrincipal createPrincipal(Long userId) {
        return new SecurityPrincipal(
                userId,
                "andrea",
                "andrea@example.com",
                "$2a$10$exampleHash",
                true,
                List.of()
        );
    }
}