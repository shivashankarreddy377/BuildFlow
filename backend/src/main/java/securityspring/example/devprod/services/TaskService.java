package securityspring.example.devprod.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import securityspring.example.devprod.ExceptionHandlers.ProjNotFound;
import securityspring.example.devprod.ExceptionHandlers.TaskNotfound;
import securityspring.example.devprod.ExceptionHandlers.UnAuthorizedexception;
import securityspring.example.devprod.Specificationclass.TaskSpecification;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.Task;
import securityspring.example.devprod.repositories.Projectrepo;
import securityspring.example.devprod.repositories.Taskrepo;
import securityspring.example.devprod.repositories.Userrepo;
import securityspring.example.devprod.validmodule.TaskRequest;

import java.util.List;

@Service
public class TaskService {
    @Autowired
    private Taskrepo taskrepo;
    @Autowired
    private Projectrepo projectrepo;
    @Autowired
    private Userrepo userrepo;

    public Task createtask(TaskRequest taskRequest, int proj_id){

        Task task=new Task();
        task.setTech(taskRequest.getTech());
        task.setStatus(false);
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setDue_date(taskRequest.getDue_date());
        Project project=projectrepo.findById(proj_id).orElseThrow(()->new ProjNotFound("no proj found"+proj_id));
        task.setProj(project);
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        if(!project.getUser().getUsername().equals(username))throw new UnAuthorizedexception("this task nor yours");
        return  taskrepo.save(task);

    }

    public Page<Task> tasksofproject(int proj_id, Boolean status, String tech, int page, int size){
        Project project=projectrepo.findById(proj_id).orElseThrow(()->new ProjNotFound("no proj found"+proj_id));
        Pageable pageable= PageRequest.of(page,size);
        Specification<Task>spec=Specification.where(TaskSpecification.hasProject(project));
        if(status != null){
            spec = spec.and(
                    TaskSpecification.hasStatus(status)
            );
        }

        if(tech != null){
            spec = spec.and(
                    TaskSpecification.hasTech(tech)
            );
        }
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        if(!project.getUser().getUsername().equals(username))throw new UnAuthorizedexception("this project not yours");
        return taskrepo.findAll(spec,pageable);
    }
    public Task taskbyid(int taskid){

        Task task=taskrepo.findById(taskid).orElseThrow(()->new TaskNotfound("there was No task "+taskid));
        String username= SecurityContextHolder.getContext().getAuthentication().getName();

        if(!task.getProj().getUser().getUsername().equals(username))throw new UnAuthorizedexception("this task not yours");
        return task;
    }
    public void DeleteTask(int taskid){
        Task task=taskrepo.findById(taskid).orElseThrow(()->new TaskNotfound("task not found"+taskid));
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        if(!username.equals(task.getProj().getUser().getUsername()))throw new UnAuthorizedexception("this task is not yours");
        taskrepo.delete(task);
    }

}
