package com.pms.model;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonCreator;

public enum PatientStatus {
  ADMITTED,
  CRITICAL,
  IN_TREATMENT("IN TREATMENT"),
  UNDER_OBSERVATION("UNDER OBSERVATION"),
  STABLE,
  RECOVERING,
  DISCHARGED,
  FOLLOW_UP_REQUIRED("FOLLOW-UP REQUIRED"),
  SCHEDULED,
  NO_SHOW("NO-SHOW");

  private final String displayName;

  PatientStatus() {
    this.displayName = this.name().replace('_', ' ');
  }

  PatientStatus(String displayName) {
    this.displayName = displayName;
  }

  public String getDisplayName() {
    return displayName;
  }

  @JsonValue
  public String toJson() {
    return displayName;
  }

  @JsonCreator
  public static PatientStatus fromJson(String value) {
    return fromString(value);
  }

  public static PatientStatus fromString(String value) {
    for (PatientStatus status : PatientStatus.values()) {
      if (status.displayName.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Invalid patient status: " + value);
  }
}
