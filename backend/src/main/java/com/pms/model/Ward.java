package com.pms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wards")
public class Ward {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "ward_name", nullable = false, unique = true)
  private String wardName;

  @Column(nullable = false)
  private Integer capacity;

  @Column(name = "available_beds", nullable = false)
  private Integer availableBeds;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getWardName() { return wardName; }
  public void setWardName(String wardName) { this.wardName = wardName; }
  public Integer getCapacity() { return capacity; }
  public void setCapacity(Integer capacity) { this.capacity = capacity; }
  public Integer getAvailableBeds() { return availableBeds; }
  public void setAvailableBeds(Integer availableBeds) { this.availableBeds = availableBeds; }
}
