package com.pms.repository;

import com.pms.model.Ward;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface WardRepository extends JpaRepository<Ward, Long> {
	List<Ward> findAllBy(Pageable pageable);

	@Query("SELECT COALESCE(SUM(w.availableBeds), 0) FROM Ward w")
	Long sumAvailableBeds();
}
