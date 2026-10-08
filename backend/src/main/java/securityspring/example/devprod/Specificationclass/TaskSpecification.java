package securityspring.example.devprod.Specificationclass;

import org.springframework.data.jpa.domain.Specification;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.Task;

public class TaskSpecification {
    public static Specification<Task>hasProject(Project project){
        return(root,query,cb)->cb.equal(root.get("proj"),project);
    }
    public static Specification<Task>hasStatus(Boolean status){
        return (root,query,cb)->cb.equal(root.get("status"),status);
    }
    public static Specification<Task>hasTech(String tech){
        return (root,query,cb)->cb.like(root.get("tech"),"%"+tech+"%");
    }
}
