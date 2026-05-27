package com.pms.dto;

import com.pms.model.PatientStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PatientStatusUpdateRequest {
  @NotNull(message = "New status is required")
  private PatientStatus newStatus;

  @Size(max = 255, message = "Notes cannot exceed 255 characters")
  private String notes;

  public PatientStatusUpdateRequest() {}

  public PatientStatusUpdateRequest(PatientStatus newStatus, String notes) {
    this.newStatus = newStatus;
    this.notes = notes;
  }

  public PatientStatus getNewStatus() {
    return newStatus;
  }

  public void setNewStatus(PatientStatus newStatus) {
    this.newStatus = newStatus;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
