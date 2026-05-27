package com.pms.controller;

import com.pms.dto.UserRoleUpdateRequest;
import com.pms.model.User;
import com.pms.repository.UserRepository;
import com.pms.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@SuppressWarnings("null")
public class UserController {

  private final UserRepository repository;
  private final PasswordEncoder passwordEncoder;
  private final UserService userService;

  public UserController(UserRepository repository, PasswordEncoder passwordEncoder, UserService userService) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
    this.userService = userService;
  }

  @GetMapping
  public List<User> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int limit
  ) {
    int boundedLimit = Math.max(1, Math.min(limit, 500));
    int boundedPage = Math.max(page, 0);
    return repository.findAllBy(PageRequest.of(boundedPage, boundedLimit, Sort.by(Sort.Direction.DESC, "id")));
  }

  @PostMapping
  public ResponseEntity<User> create(@Valid @RequestBody User user) {
    if (user.getRole() == null) {
      return ResponseEntity.badRequest().build();
    }

    if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
      return ResponseEntity.badRequest().build();
    }

    user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
    return ResponseEntity.ok(repository.save(user));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/role")
  public ResponseEntity<User> updateRole(@PathVariable Long id, @Valid @RequestBody UserRoleUpdateRequest request) {
    return repository.findById(id)
      .map(user -> {
        user.setRole(request.getRole());
        User updated = repository.save(user);
        return ResponseEntity.ok(updated);
      })
      .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping("/generate-password")
  public ResponseEntity<?> generateDefaultPassword(
    @RequestParam(value = "username", required = true) String username,
    @RequestParam(value = "patientId", required = false) Long patientId
  ) {
    try {
      String generatedPassword = userService.generateDefaultPassword(username, patientId != null ? patientId : 0L);
      return ResponseEntity.ok(Map.of(
        "username", username,
        "patientId", patientId != null ? patientId : 0L,
        "generatedPassword", generatedPassword,
        "note", "Format: username + patient_id (e.g., john_doe + 123 → john_doe123)"
      ));
    } catch (Exception ex) {
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate password: " + ex.getMessage()));
    }
  }
}
