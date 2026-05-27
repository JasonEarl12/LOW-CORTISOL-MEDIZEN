package com.pms.controller;

import com.pms.model.Billing;
import com.pms.repository.BillingRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing")
@SuppressWarnings("null")
public class BillingController {

  private final BillingRepository repository;

  public BillingController(BillingRepository repository) { this.repository = repository; }

  @GetMapping
  public List<Billing> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int limit
  ) {
    int boundedLimit = Math.max(1, Math.min(limit, 500));
    int boundedPage = Math.max(page, 0);
    return repository.findAllBy(PageRequest.of(boundedPage, boundedLimit, Sort.by(Sort.Direction.DESC, "id")));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Billing> getById(@PathVariable Long id) {
    return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public Billing create(@Valid @RequestBody Billing billing) { return repository.save(billing); }

  @PutMapping("/{id}")
  public ResponseEntity<Billing> update(@PathVariable Long id, @Valid @RequestBody Billing billing) {
    return repository.findById(id).map(existing -> {
      billing.setId(existing.getId());
      return ResponseEntity.ok(repository.save(billing));
    }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) return ResponseEntity.notFound().build();
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
