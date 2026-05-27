package com.pms.controller;

import com.pms.model.Appointment;
import com.pms.repository.AppointmentRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@SuppressWarnings("null")
public class AppointmentController {

  private final AppointmentRepository repository;

  public AppointmentController(AppointmentRepository repository) { this.repository = repository; }

  @GetMapping
  public List<Appointment> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int limit
  ) {
    int boundedLimit = Math.max(1, Math.min(limit, 500));
    int boundedPage = Math.max(page, 0);
    return repository.findListWithRelations(PageRequest.of(boundedPage, boundedLimit, Sort.by(Sort.Direction.DESC, "id")));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Appointment> getById(@PathVariable Long id) {
    return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public Appointment create(@Valid @RequestBody Appointment appointment) { return repository.save(appointment); }

  @PutMapping("/{id}")
  public ResponseEntity<Appointment> update(@PathVariable Long id, @Valid @RequestBody Appointment appointment) {
    return repository.findById(id).map(existing -> {
      appointment.setId(existing.getId());
      return ResponseEntity.ok(repository.save(appointment));
    }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) return ResponseEntity.notFound().build();
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
