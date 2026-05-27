package com.pms.controller;

import com.pms.model.Patient;
import com.pms.dto.PatientStatusUpdateRequest;
import com.pms.repository.PatientRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@SuppressWarnings("null")
public class PatientController {

  private final PatientRepository repository;

  public PatientController(PatientRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public List<Patient> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int limit
  ) {
    int boundedLimit = Math.max(1, Math.min(limit, 500));
    int boundedPage = Math.max(page, 0);
    return repository.findAllBy(PageRequest.of(boundedPage, boundedLimit, Sort.by(Sort.Direction.DESC, "id")));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Patient> getById(@PathVariable Long id) {
    return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @GetMapping("/{id}/full-profile")
  public ResponseEntity<Patient> getFullProfile(@PathVariable Long id) {
    Patient patient = repository.getFullProfile(id);
    if (patient == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(patient);
  }

  @GetMapping("/{id}/status-history")
  public ResponseEntity<?> getStatusHistory(@PathVariable Long id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    List<Object[]> history = repository.getPatientStatusHistory(id);
    return ResponseEntity.ok(history);
  }

  @PostMapping
  public Patient create(@Valid @RequestBody Patient patient) {
    return repository.save(patient);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Patient> update(@PathVariable Long id, @Valid @RequestBody Patient patient) {
    return repository.findById(id)
      .map(existing -> {
        patient.setId(existing.getId());
        return ResponseEntity.ok(repository.save(patient));
      }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}/status")
  public ResponseEntity<Patient> updateStatus(
    @PathVariable Long id,
    @Valid @RequestBody PatientStatusUpdateRequest request) {
    
    return repository.findById(id)
      .map(existing -> {
        existing.setStatus(request.getNewStatus());
        Patient updated = repository.save(existing);
        
        // Ideally, also log to patient_status_history with user context
        // This requires authentication/user context to be fully implemented
        
        return ResponseEntity.ok(updated);
      }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
