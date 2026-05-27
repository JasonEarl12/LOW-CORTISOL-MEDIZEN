package com.pms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false)
  private String action;

  @Column(nullable = false)
  private String module;

  @Column(name = "record_id")
  private Long recordId;

  @Column(name = "timestamp", nullable = false)
  private LocalDateTime timestamp;

  @PrePersist
  void onCreate() {
    timestamp = LocalDateTime.now();
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public User getUser() { return user; }
  public void setUser(User user) { this.user = user; }
  public String getAction() { return action; }
  public void setAction(String action) { this.action = action; }
  public String getModule() { return module; }
  public void setModule(String module) { this.module = module; }
  public Long getRecordId() { return recordId; }
  public void setRecordId(Long recordId) { this.recordId = recordId; }
  public LocalDateTime getTimestamp() { return timestamp; }
}
