package securityspring.example.devprod.Specificationclass;

import org.springframework.data.jpa.domain.Specification;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.Task;
import securityspring.example.devprod.module.User;

public class ProjectSpecification {
    public static Specification<Project>hasStatus(Boolean status){
        return (root,query,cb)->
                cb.equal(root.get("status"),status);

    }
    public static Specification<Project>hasTitle(String Title){
        return (root,query,cb)->
                cb.like(root.get("title"),"%"+Title+"%");
    }
    public static Specification<Project>hasUser(User user){
        return ((root, query, cb) ->
                cb.equal(root.get("user"),user));
    }
}
