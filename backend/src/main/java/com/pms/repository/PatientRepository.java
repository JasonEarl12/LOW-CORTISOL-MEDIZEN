package com.pms.repository;

import com.pms.model.Patient;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {

  List<Patient> findAllBy(Pageable pageable);

  @Query("SELECT p FROM Patient p WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
  List<Patient> findByFullNameContaining(@Param("name") String name);

  @Modifying
  @Transactional
  @Query(value = "CALL sp_update_patient_status(:patientId, :newStatus, :changedByUserId, :notes)", 
         nativeQuery = true)
  void updatePatientStatusViaProcedure(
    @Param("patientId") Long patientId,
    @Param("newStatus") String newStatus,
    @Param("changedByUserId") Long changedByUserId,
    @Param("notes") String notes
  );

  @Query(value = "SELECT * FROM v_patient_full_profile WHERE id = :patientId", nativeQuery = true)
  Patient getFullProfile(@Param("patientId") Long patientId);

  @Query(value = """
    SELECT psh.id, psh.patient_id, psh.old_status, psh.new_status, 
           psh.changed_by_user_id, psh.change_source, psh.notes, psh.changed_at 
    FROM patient_status_history psh 
    WHERE psh.patient_id = :patientId 
    ORDER BY psh.changed_at DESC
    """, nativeQuery = true)
  List<Object[]> getPatientStatusHistory(@Param("patientId") Long patientId);
}
