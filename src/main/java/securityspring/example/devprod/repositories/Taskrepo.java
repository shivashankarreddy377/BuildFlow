package securityspring.example.devprod.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.Task;

import java.util.List;

@Repository
public interface Taskrepo extends JpaRepository<Task,Integer>,JpaSpecificationExecutor<Task> {
    public List<Task> findByProj(Project project);
}
