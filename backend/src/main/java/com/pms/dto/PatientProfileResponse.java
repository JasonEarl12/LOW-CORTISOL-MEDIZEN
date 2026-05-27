package com.pms.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientProfileResponse {
  private Long id;
  private String fullName;
  private LocalDate dob;
  private String gender;
  private String status;
  private String contact;
  private Long doctorId;
  private String doctorName;
  private String doctorSpecialty;
  private Long wardId;
  private String wardName;
  private String medicalHistory;
  private String documentsPath;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime lastStatusChangedAt;
  private String lastStatusFrom;
  private String lastStatusTo;

  public PatientProfileResponse() {}

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  
  public String getFullName() { return fullName; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  
  public LocalDate getDob() { return dob; }
  public void setDob(LocalDate dob) { this.dob = dob; }
  
  public String getGender() { return gender; }
  public void setGender(String gender) { this.gender = gender; }
  
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  
  public String getContact() { return contact; }
  public void setContact(String contact) { this.contact = contact; }
  
  public Long getDoctorId() { return doctorId; }
  public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
  
  public String getDoctorName() { return doctorName; }
  public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
  
  public String getDoctorSpecialty() { return doctorSpecialty; }
  public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }
  
  public Long getWardId() { return wardId; }
  public void setWardId(Long wardId) { this.wardId = wardId; }
  
  public String getWardName() { return wardName; }
  public void setWardName(String wardName) { this.wardName = wardName; }
  
  public String getMedicalHistory() { return medicalHistory; }
  public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }
  
  public String getDocumentsPath() { return documentsPath; }
  public void setDocumentsPath(String documentsPath) { this.documentsPath = documentsPath; }
  
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
  
  public LocalDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
  
  public LocalDateTime getLastStatusChangedAt() { return lastStatusChangedAt; }
  public void setLastStatusChangedAt(LocalDateTime lastStatusChangedAt) { this.lastStatusChangedAt = lastStatusChangedAt; }
  
  public String getLastStatusFrom() { return lastStatusFrom; }
  public void setLastStatusFrom(String lastStatusFrom) { this.lastStatusFrom = lastStatusFrom; }
  
  public String getLastStatusTo() { return lastStatusTo; }
  public void setLastStatusTo(String lastStatusTo) { this.lastStatusTo = lastStatusTo; }
}
