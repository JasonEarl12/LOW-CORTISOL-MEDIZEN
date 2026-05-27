package com.pms.service;

import com.pms.model.User;
import com.pms.repository.UserRepository;
import com.pms.util.PasswordUtil;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service for managing user operations including password generation.
 */
@Service
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Find a user by username.
   *
   * @param username the username to search for
   * @return an Optional containing the user if found
   */
  public Optional<User> findByUsername(String username) {
    return userRepository.findByUsername(username);
  }

  /**
   * Generate a memorable default password for a patient based on username and patient ID.
   * Format: username + patient_id
   * Example: "john_doe" + 123 → "john_doe123"
   *
   * @param username the username of the patient
   * @param patientId the patient ID
   * @return the generated password
   */
  public String generateDefaultPassword(String username, Long patientId) {
    return PasswordUtil.generateMemorablePassword(username, patientId);
  }

  /**
   * Generate a memorable default password for a patient based on username and patient ID.
   * Format: username + patient_id
   *
   * @param username the username of the patient
   * @param patientId the patient ID
   * @return the generated password
   */
  public String generateDefaultPassword(String username, int patientId) {
    return PasswordUtil.generateMemorablePassword(username, (long) patientId);
  }

  /**
   * Generate a memorable default password for a patient based on username only.
   * Patient ID will be 0.
   *
   * @param username the username of the patient
   * @return the generated password
   */
  public String generateDefaultPassword(String username) {
    return PasswordUtil.generateMemorablePassword(username);
  }

  /**
   * Reset a user's password to a newly generated memorable password.
   *
   * @param user the user whose password should be reset
   * @param plainPassword the plain text password to set
   * @return the user with updated password
   */
  public User setPassword(User user, String plainPassword) {
    user.setPasswordHash(passwordEncoder.encode(plainPassword));
    return userRepository.save(user);
  }

}
