package com.pulsepass;

import com.pulsepass.domain.Role;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.UserRole;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.UserRoleRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class SecurityPersistenceIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCredentialRepository userCredentialRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldPersistCredentialAndUserRole() {
        User user = createUser(
                "security-user",
                "security-user@example.com"
        );

        UserCredential credential = new UserCredential(
                user,
                "bcrypt-hash-for-persistence-test",
                LocalDateTime.now()
        );

        userCredentialRepository.saveAndFlush(credential);
        userRoleRepository.saveAndFlush(
                new UserRole(user, Role.USER)
        );

        entityManager.clear();

        UserCredential savedCredential =
                userCredentialRepository.findById(user.getId())
                        .orElseThrow();

        assertThat(savedCredential.getUserId())
                .isEqualTo(user.getId());

        assertThat(savedCredential.getPasswordHash())
                .isEqualTo("bcrypt-hash-for-persistence-test");

        assertThat(userRoleRepository.findByUser_Id(user.getId()))
                .extracting(UserRole::getRole)
                .containsExactly(Role.USER);
    }

    @Test
    void shouldRejectDuplicateRoleForSameUser() {
        User user = createUser(
                "duplicate-role-user",
                "duplicate-role-user@example.com"
        );

        jdbcTemplate.update(
                """
                INSERT INTO user_roles (user_id, role)
                VALUES (?, ?)
                """,
                user.getId(),
                Role.USER.name()
        );

        assertThatThrownBy(() -> jdbcTemplate.update(
                """
                INSERT INTO user_roles (user_id, role)
                VALUES (?, ?)
                """,
                user.getId(),
                Role.USER.name()
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldRejectInvalidRole() {
        User user = createUser(
                "invalid-role-user",
                "invalid-role-user@example.com"
        );

        assertThatThrownBy(() -> jdbcTemplate.update(
                """
                INSERT INTO user_roles (user_id, role)
                VALUES (?, ?)
                """,
                user.getId(),
                "SUPER_ADMIN"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    private User createUser(
            String username,
            String email
    ) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setActive(true);

        return userRepository.saveAndFlush(user);
    }
}