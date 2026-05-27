package com.pms.repository;

import com.pms.model.User;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  List<User> findAllBy(Pageable pageable);
  Optional<User> findByUsername(String username);
  Optional<User> findByEmail(String email);
}
