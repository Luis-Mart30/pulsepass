package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRoleRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CustomUserDetailsService
                implements UserDetailsService {

        private final UserCredentialRepository userCredentialRepository;

        private final UserRoleRepository userRoleRepository;

        public CustomUserDetailsService(
                        UserCredentialRepository userCredentialRepository,
                        UserRoleRepository userRoleRepository) {
                this.userCredentialRepository = userCredentialRepository;
                this.userRoleRepository = userRoleRepository;
        }

        @Override
        public UserDetails loadUserByUsername(
                        String identifier) throws UsernameNotFoundException {

                UserCredential credential = userCredentialRepository
                                .findByUser_Username(identifier)
                                .or(() -> userCredentialRepository
                                                .findByUser_EmailIgnoreCase(identifier))
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "Invalid credentials."));

                return createPrincipal(credential);
        }

        public SecurityPrincipal loadByUserId(Long userId) {
                UserCredential credential = userCredentialRepository
                                .findById(userId)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "Invalid credentials."));

                return createPrincipal(credential);
        }

        private SecurityPrincipal createPrincipal(
                        UserCredential credential) {
                User user = credential.getUser();

                List<GrantedAuthority> authorities = userRoleRepository
                                .findByUser_Id(user.getId())
                                .stream()
                                .map(userRole -> new SimpleGrantedAuthority(
                                                "ROLE_"
                                                                + userRole
                                                                                .getRole()
                                                                                .name()))
                                .map(GrantedAuthority.class::cast)
                                .toList();

                return new SecurityPrincipal(
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                credential.getPasswordHash(),
                                user.isActive(),
                                authorities);
        }

}