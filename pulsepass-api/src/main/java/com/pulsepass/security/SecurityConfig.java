package com.pulsepass.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties({
        CorsProperties.class
})
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource
                        )
                )

                .formLogin(AbstractHttpConfigurer::disable)

                .httpBasic(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(exceptions ->
                        exceptions
                                .authenticationEntryPoint(
                                        authenticationEntryPoint
                                )
                                .accessDeniedHandler(
                                        accessDeniedHandler
                                )
                )

                .authorizeHttpRequests(authorize ->
                        authorize
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/auth/login",
                                        "/api/users"
                                )
                                .permitAll()

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/events/published",
                                        "/api/events/by-artist",
                                        "/api/venues/**",
                                        "/api/artists/**"
                                )
                                .permitAll()

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/events/*"
                                )
                                .permitAll()

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/events"
                                )
                                .hasRole("ADMIN")

                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/events/*/publish"
                                )
                                .hasRole("ADMIN")

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/events/*/artists/*"
                                )
                                .hasRole("ADMIN")

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/events/*/tickets/paid"
                                )
                                .hasAnyRole(
                                        "STAFF",
                                        "ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/tickets/*/use"
                                )
                                .hasAnyRole(
                                        "STAFF",
                                        "ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/tickets"
                                )
                                .hasRole("USER")

                                .anyRequest()
                                .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter>
    jwtAuthenticationFilterRegistration(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(
                        jwtAuthenticationFilter
                );

        registration.setEnabled(false);

        return registration;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            CorsProperties corsProperties
    ) {
        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                corsProperties.allowedOrigins()
        );

        configuration.setAllowedMethods(
                List.of(
                        HttpMethod.GET.name(),
                        HttpMethod.POST.name(),
                        HttpMethod.PATCH.name(),
                        HttpMethod.OPTIONS.name()
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE,
                        HttpHeaders.ACCEPT
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        HttpHeaders.LOCATION
                )
        );

        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}