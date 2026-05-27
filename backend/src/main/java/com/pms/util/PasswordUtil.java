package com.pms.util;

/**
 * Utility class for generating memorable default passwords.
 * 
 * Password format: username + patient_id
 * Example: john_doe with patient_id 123 → "john_doe123"
 */
public class PasswordUtil {

  /**
   * Generate a memorable password from a patient's username and patient ID.
   *
   * @param username the username of the patient
   * @param patientId the patient ID
   * @return a memorable password
   */
  public static String generateMemorablePassword(String username, Long patientId) {
    String user = (username != null ? username.trim() : "patient");
    if (user.isEmpty()) {
      user = "patient";
    }
    
    long id = patientId != null && patientId > 0 ? patientId : 0L;
    return user + id;
  }

  /**
   * Generate a memorable password from a patient's username and patient ID.
   *
   * @param username the username of the patient
   * @param patientId the patient ID
   * @return a memorable password
   */
  public static String generateMemorablePassword(String username, int patientId) {
    return generateMemorablePassword(username, (long) patientId);
  }

  /**
   * Generate a memorable password from a patient's username only.
   * Patient ID will be set to 0.
   *
   * @param username the username of the patient
   * @return a memorable password
   */
  public static String generateMemorablePassword(String username) {
    return generateMemorablePassword(username, 0L);
  }

}
