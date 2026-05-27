package com.pms.repository;

import com.pms.model.Billing;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillingRepository extends JpaRepository<Billing, Long> {
	List<Billing> findAllBy(Pageable pageable);
}
