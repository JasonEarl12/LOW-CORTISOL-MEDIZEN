package com.pms.controller;

import com.pms.model.Doctor;
import com.pms.repository.DoctorRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
@SuppressWarnings("null")
public class DoctorController {

  private final DoctorRepository repository;

  public DoctorController(DoctorRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public List<Doctor> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int limit
  ) {
    int boundedLimit = Math.max(1, Math.min(limit, 500));
    int boundedPage = Math.max(page, 0);
    return repository.findAllBy(PageRequest.of(boundedPage, boundedLimit, Sort.by(Sort.Direction.DESC, "id")));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Doctor> getById(@PathVariable Long id) {
    return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public Doctor create(@Valid @RequestBody Doctor doctor) { return repository.save(doctor); }

  @PutMapping("/{id}")
  public ResponseEntity<Doctor> update(@PathVariable Long id, @Valid @RequestBody Doctor doctor) {
    return repository.findById(id).map(existing -> {
      doctor.setId(existing.getId());
      return ResponseEntity.ok(repository.save(doctor));
    }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) return ResponseEntity.notFound().build();
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
