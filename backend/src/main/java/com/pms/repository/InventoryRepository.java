package com.pms.repository;

import com.pms.model.Inventory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
	List<Inventory> findAllBy(Pageable pageable);
}
