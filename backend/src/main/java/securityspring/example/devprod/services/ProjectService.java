package securityspring.example.devprod.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.autoconfigure.web.DataWebProperties;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import securityspring.example.devprod.ExceptionHandlers.ProjNotFound;
import securityspring.example.devprod.ExceptionHandlers.UnAuthorizedexception;
import securityspring.example.devprod.ExceptionHandlers.UserNotfound;
import securityspring.example.devprod.Specificationclass.ProjectSpecification;
import securityspring.example.devprod.Specificationclass.TaskSpecification;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Projectrepo;
import securityspring.example.devprod.repositories.Userrepo;
import securityspring.example.devprod.validmodule.ProjectRequest;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    @Autowired
    private Projectrepo projectrepo;
    @Autowired
    private Userrepo userrepo;
    @Autowired
    private EmailService emailService;

    public Project createproject( ProjectRequest projectRequest){
        Project project=new Project();
        project.setStatus(false);
        project.setDescription(projectRequest.getDescription());
        project.setTitle(projectRequest.getTitle());
        project.setDue_date(projectRequest.getDue_date());
        project.setFilename(projectRequest.getFilename());
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userrepo.findByUsername(username);
       project.setUser(user);
       project=projectrepo.save(project);
       emailService.sendProjectCreatedMail(user.getEmail(),project.getTitle());
       return project;
    }

    public Page<Project> projectsofuser(int page,int size){
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userrepo.findByUsername(username);
        Pageable pageable= PageRequest.of(page,size,Sort.by(Sort.Direction.DESC, "id"));
        return projectrepo.findByUser(user,pageable);
    }
    @Cacheable(value = "projects",key="#proj_id")
    public Project projectbyid(int proj_id){

        Project project= projectrepo.findById(proj_id).orElseThrow(()->new ProjNotFound("proj not found"+proj_id));
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        if(!username.equals(project.getUser().getUsername()))throw new UnAuthorizedexception("this projct not yours");
        return project;
    }
    public void deleteproject(int projectid){
        Project project=projectrepo.findById(projectid).orElseThrow(()->new ProjNotFound("proj not found"+projectid));
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        if(!username.equals(project.getUser().getUsername()))throw new UnAuthorizedexception("this proj not yours");
        projectrepo.delete(project);
    }
    public Page<Project> findbyserandtitle(int page,int size,String title,Boolean status){
        Pageable pageable=PageRequest.of(page,size,Sort.by(Sort.Direction.DESC, "id"));
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userrepo.findByUsername(username);
        Specification<Project>spec=Specification.where(ProjectSpecification.hasUser(user));
        if(status!=null){
            spec=spec.and(ProjectSpecification.hasStatus(status));
        }
        if(title!=null && !title.trim().isEmpty()){
            spec=spec.and(ProjectSpecification.hasTitle(title.trim()));
        }

        return projectrepo.findAll(spec,pageable);
    }

    public Project toggleStatus(int proj_id) {
        Project project = projectrepo.findById(proj_id)
                .orElseThrow(() -> new ProjNotFound("Project not found: " + proj_id));
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!username.equals(project.getUser().getUsername())) {
            throw new UnAuthorizedexception("This project does not belong to you");
        }
        project.setStatus(!project.isStatus());
        return projectrepo.save(project);
    }

    public Resource getFile(int projectId) throws MalformedURLException, MalformedURLException {

        Project project = projectrepo.findById(projectId)
                .orElseThrow(() ->
                        new ProjNotFound("Project not found"));

        Path path = Paths.get("uploads")
                .resolve(project.getFilename());

        return new UrlResource(path.toUri());
    }
}
