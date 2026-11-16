package com.pulsepass.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_credentials")
public class UserCredential {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    public UserCredential() {
    }

    public UserCredential(
            User user,
            String passwordHash,
            LocalDateTime passwordChangedAt
    ) {
        this.user = user;
        this.passwordHash = passwordHash;
        this.passwordChangedAt = passwordChangedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public User getUser() {
        return user;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }

    public void setPasswordChangedAt(
            LocalDateTime passwordChangedAt
    ) {
        this.passwordChangedAt = passwordChangedAt;
    }
}