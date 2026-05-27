package com.pms.repository;

import com.pms.model.Appointment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
	@EntityGraph(attributePaths = {"patient", "doctor"})
	@Query("SELECT a FROM Appointment a")
	List<Appointment> findAllWithRelations();

	@EntityGraph(attributePaths = {"patient", "doctor"})
	@Query("SELECT a FROM Appointment a")
	List<Appointment> findListWithRelations(Pageable pageable);

	long countByDate(LocalDate date);
}
