package com.pms.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  @Column(nullable = false)
  private LocalDate dob;

  @Column(nullable = false)
  private String gender;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PatientStatus status = PatientStatus.ADMITTED;

  private String contact;

  @ManyToOne
  @JoinColumn(name = "doctor_id")
  private Doctor doctor;

  @ManyToOne
  @JoinColumn(name = "ward_id")
  private Ward ward;

  @Column(name = "medical_history", columnDefinition = "TEXT")
  private String medicalHistory;

  @Column(name = "documents_path")
  private String documentsPath;

  @Column(name = "username", unique = true)
  private String username;

  @Column(name = "password")
  private String password;

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
  public String getFullName() { return fullName; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  public LocalDate getDob() { return dob; }
  public void setDob(LocalDate dob) { this.dob = dob; }
  public String getGender() { return gender; }
  public void setGender(String gender) { this.gender = gender; }
  public String getContact() { return contact; }
  public void setContact(String contact) { this.contact = contact; }
  public PatientStatus getStatus() { return status; }
  public void setStatus(PatientStatus status) { this.status = status; }
  public Doctor getDoctor() { return doctor; }
  public void setDoctor(Doctor doctor) { this.doctor = doctor; }
  public Ward getWard() { return ward; }
  public void setWard(Ward ward) { this.ward = ward; }
  public String getMedicalHistory() { return medicalHistory; }
  public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }
  public String getDocumentsPath() { return documentsPath; }
  public void setDocumentsPath(String documentsPath) { this.documentsPath = documentsPath; }
  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }
  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }
}
