package com.pms.controller;

import com.pms.repository.AppointmentRepository;
import com.pms.repository.DoctorRepository;
import com.pms.repository.PatientRepository;
import com.pms.repository.WardRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

  private final PatientRepository patientRepository;
  private final DoctorRepository doctorRepository;
  private final WardRepository wardRepository;
  private final AppointmentRepository appointmentRepository;

  public DashboardController(
    PatientRepository patientRepository,
    DoctorRepository doctorRepository,
    WardRepository wardRepository,
    AppointmentRepository appointmentRepository
  ) {
    this.patientRepository = patientRepository;
    this.doctorRepository = doctorRepository;
    this.wardRepository = wardRepository;
    this.appointmentRepository = appointmentRepository;
  }

  @GetMapping("/metrics")
  public Map<String, Long> getMetrics() {
    long totalPatients = patientRepository.count();
    long activeDoctors = doctorRepository.count();
    long availableBeds = wardRepository.sumAvailableBeds();
    long todaysAppointments = appointmentRepository.countByDate(LocalDate.now());

    return Map.of(
      "totalPatients", totalPatients,
      "activeDoctors", activeDoctors,
      "availableBeds", availableBeds,
      "todaysAppointments", todaysAppointments
    );
  }
}
