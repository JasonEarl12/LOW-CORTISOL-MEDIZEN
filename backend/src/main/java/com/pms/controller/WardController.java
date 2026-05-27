package com.pms.controller;

import com.pms.model.Ward;
import com.pms.repository.WardRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wards")
@SuppressWarnings("null")
public class WardController {

  private final WardRepository repository;

  public WardController(WardRepository repository) { this.repository = repository; }

  @GetMapping
  public List<Ward> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int limit
  ) {
    int boundedLimit = Math.max(1, Math.min(limit, 500));
    int boundedPage = Math.max(page, 0);
    return repository.findAllBy(PageRequest.of(boundedPage, boundedLimit, Sort.by(Sort.Direction.DESC, "id")));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Ward> getById(@PathVariable Long id) {
    return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public Ward create(@Valid @RequestBody Ward ward) { return repository.save(ward); }

  @PutMapping("/{id}")
  public ResponseEntity<Ward> update(@PathVariable Long id, @Valid @RequestBody Ward ward) {
    return repository.findById(id).map(existing -> {
      ward.setId(existing.getId());
      return ResponseEntity.ok(repository.save(ward));
    }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) return ResponseEntity.notFound().build();
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
