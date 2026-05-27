package com.pms.config;

import com.pms.model.Role;
import com.pms.model.User;
import com.pms.repository.UserRepository;
import com.pms.util.PasswordUtil;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class TestUserSeeder implements CommandLineRunner {

  private static final Logger LOGGER = LoggerFactory.getLogger(TestUserSeeder.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${app.seed-test-users:true}")
  private boolean seedTestUsers;

  public TestUserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(String... args) {
    if (!seedTestUsers) {
      LOGGER.info("Test user seeding is disabled (app.seed-test-users=false)");
      return;
    }

    List<SeedUser> users = List.of(
      new SeedUser("admin", "System Administrator", "admin@medizen.com", Role.ADMIN),
      new SeedUser("doctor", "Dr. Julian Vance", "dr.julian.vance@medizen.com", Role.DOCTOR),
      new SeedUser("dr_smith", "Dr. Marcus Chen", "dr.marcus.smith@medizen.com", Role.DOCTOR),
      new SeedUser("nurse", "Sarah Jenkins", "sarah.jenkins@medizen.com", Role.NURSE),
      new SeedUser("staff", "John Doe", "john.doe@medizen.com", Role.NURSE),
      new SeedUser("patient", "Sarah Miller", "sarah.miller@email.com", Role.PATIENT),
      new SeedUser("patient2", "Robert Jenkins", "robert.jenkins@email.com", Role.PATIENT),
      new SeedUser("eleanor_miller", "Eleanor Miller", "eleanor.miller@medizen.com", Role.PATIENT),
      new SeedUser("robert_jenkins", "Robert Jenkins", "robert.jenkins@medizen.com", Role.PATIENT),
      new SeedUser("sarah_williams", "Sarah Williams", "sarah.williams@medizen.com", Role.PATIENT),
      new SeedUser("anna_cortez", "Anna Cortez", "anna.cortez@medizen.com", Role.PATIENT),
      new SeedUser("mark_salazar", "Mark Salazar", "mark.salazar@medizen.com", Role.PATIENT),
      new SeedUser("isabella_torres", "Isabella Torres", "isabella.torres@medizen.com", Role.PATIENT),
      new SeedUser("joshua_villanueva", "Joshua Villanueva", "joshua.villanueva@medizen.com", Role.PATIENT),
      new SeedUser("camille_reyes", "Camille Reyes", "camille.reyes@medizen.com", Role.PATIENT),
      new SeedUser("daniel_navarro", "Daniel Navarro", "daniel.navarro@medizen.com", Role.PATIENT),
      new SeedUser("sophia_dela_cruz", "Sophia Dela Cruz", "sophia.delacruz@medizen.com", Role.PATIENT),
      new SeedUser("miguel_aquino", "Miguel Aquino", "miguel.aquino@medizen.com", Role.PATIENT),
      new SeedUser("lara_mendoza", "Lara Mendoza", "lara.mendoza@medizen.com", Role.PATIENT),
      new SeedUser("rodolfo_yapan", "Rodolfo Yapan", "rodolfo.yapan@medizen.com", Role.PATIENT),
      new SeedUser("mika_tan", "Mika Tan", "mika.tan@medizen.com", Role.PATIENT),
      new SeedUser("paolo_vergara", "Paolo Vergara", "paolo.vergara@medizen.com", Role.PATIENT),
      new SeedUser("marco_sta_ana", "Marco Sta Ana", "marco.staana@medizen.com", Role.PATIENT),
      new SeedUser("sofia_first", "Sofia First", "sofia.first@medizen.com", Role.PATIENT),
      new SeedUser("kira_mendoza", "Kira Mendoza", "kira.mendoza@medizen.com", Role.PATIENT),
      new SeedUser("benj_navarro", "Benj Navarro", "benj.navarro@medizen.com", Role.PATIENT),
      new SeedUser("janelle_cruz", "Janelle Cruz", "janelle.cruz@medizen.com", Role.PATIENT),
      new SeedUser("tristan_ong", "Tristan Ong", "tristan.ong@medizen.com", Role.PATIENT),
      new SeedUser("nora_lim", "Nora Lim", "nora.lim@medizen.com", Role.PATIENT),
      new SeedUser("alden_ramos", "Alden Ramos", "alden.ramos@medizen.com", Role.PATIENT),
      new SeedUser("lea_bautista", "Lea Bautista", "lea.bautista@medizen.com", Role.PATIENT),
      new SeedUser("satoru_gojo", "Satoru Gojo", "satoru.gojo@medizen.com", Role.PATIENT),
      new SeedUser("mina_alvarez", "Mina Alvarez", "mina.alvarez@medizen.com", Role.PATIENT),
      new SeedUser("haruto_saito", "Haruto Saito", "haruto.saito@medizen.com", Role.PATIENT),
      new SeedUser("yuna_park", "Yuna Park", "yuna.park@medizen.com", Role.PATIENT),
      new SeedUser("caleb_lim", "Caleb Lim", "caleb.lim@medizen.com", Role.PATIENT),
      new SeedUser("rina_santos", "Rina Santos", "rina.santos@medizen.com", Role.PATIENT),
      new SeedUser("victor_co", "Victor Co", "victor.co@medizen.com", Role.PATIENT),
      new SeedUser("elaine_uy", "Elaine Uy", "elaine.uy@medizen.com", Role.PATIENT),
      new SeedUser("noel_javier", "Noel Javier", "noel.javier@medizen.com", Role.PATIENT),
      new SeedUser("patricia_ong", "Patricia Ong", "patricia.ong@medizen.com", Role.PATIENT),
      new SeedUser("public_user", "John Public", "visitor@medizen.com", Role.PUBLIC_USER),
      new SeedUser("visitor", "Community Member", "community@medizen.com", Role.PUBLIC_USER)
    );

    for (SeedUser seedUser : users) {
      upsertUser(seedUser);
    }
  }

  private void upsertUser(SeedUser seedUser) {
    try {
      User user = userRepository.findByUsername(seedUser.username()).orElseGet(User::new);
      user.setUsername(seedUser.username());
      user.setFullName(seedUser.fullName());
      user.setEmail(seedUser.email());
      user.setRole(seedUser.role());

      // Generate appropriate password:
      // - For PATIENT roles, generate a memorable password from username + patient_id (0 if not set yet)
      // - For non-patient roles, use "password"
      String rawPassword;
      if (seedUser.role() == Role.PATIENT) {
        rawPassword = PasswordUtil.generateMemorablePassword(seedUser.username());
      } else {
        rawPassword = "password";
      }
      
      user.setPasswordHash(passwordEncoder.encode(rawPassword));

      userRepository.save(user);
    } catch (DataAccessException ex) {
      LOGGER.warn("Skipping seed user '{}' due to database constraint/schema mismatch: {}", seedUser.username(), ex.getMessage());
    }
  }

  private record SeedUser(String username, String fullName, String email, Role role) {}
}
