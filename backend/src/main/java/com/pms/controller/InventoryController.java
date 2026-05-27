package com.pms.controller;

import com.pms.model.Inventory;
import com.pms.repository.InventoryRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@SuppressWarnings("null")
public class InventoryController {

  private final InventoryRepository repository;

  public InventoryController(InventoryRepository repository) { this.repository = repository; }

  @GetMapping
  public List<Inventory> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int limit
  ) {
    int boundedLimit = Math.max(1, Math.min(limit, 500));
    int boundedPage = Math.max(page, 0);
    return repository.findAllBy(PageRequest.of(boundedPage, boundedLimit, Sort.by(Sort.Direction.DESC, "id")));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Inventory> getById(@PathVariable Long id) {
    return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public Inventory create(@Valid @RequestBody Inventory inventory) { return repository.save(inventory); }

  @PutMapping("/{id}")
  public ResponseEntity<Inventory> update(@PathVariable Long id, @Valid @RequestBody Inventory inventory) {
    return repository.findById(id).map(existing -> {
      inventory.setId(existing.getId());
      return ResponseEntity.ok(repository.save(inventory));
    }).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) return ResponseEntity.notFound().build();
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
