package securityspring.example.devprod.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import securityspring.example.devprod.module.User;

@Repository
public interface Userrepo extends JpaRepository<User,Integer> {
       public User findByUsername(String username);
}
