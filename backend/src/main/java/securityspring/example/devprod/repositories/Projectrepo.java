package securityspring.example.devprod.repositories;


import org.springframework.boot.data.autoconfigure.web.DataWebProperties;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface Projectrepo extends JpaRepository<Project,Integer> , JpaSpecificationExecutor<Project> {
    public Page<Project> findByUser(User user, Pageable pageable);
    public Page<Project>  findByUserAndTitle(User user,String Title,Pageable pageable);
    public long countByUser(User user);
    public long countByUserAndStatus(User user, boolean status);


}