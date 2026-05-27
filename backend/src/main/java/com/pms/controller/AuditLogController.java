package com.pms.controller;

import com.pms.model.AuditLog;
import com.pms.repository.AuditLogRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

  private final AuditLogRepository repository;

  public AuditLogController(AuditLogRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public List<AuditLog> getAll(@RequestParam(defaultValue = "300") int limit) {
    int boundedLimit = Math.max(1, Math.min(limit, 1000));
    return repository.findAll(PageRequest.of(0, boundedLimit, Sort.by(Sort.Direction.DESC, "timestamp"))).getContent();
  }
}
