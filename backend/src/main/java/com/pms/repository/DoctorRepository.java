package com.pms.repository;

import com.pms.model.Doctor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
	List<Doctor> findAllBy(Pageable pageable);
}
