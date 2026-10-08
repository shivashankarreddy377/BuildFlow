package securityspring.example.devprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.services.ProjectService;
import securityspring.example.devprod.validmodule.ProjectRequest;

import java.awt.*;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
public class ProjectController {
    @Autowired
    public ProjectService projectService;
    @GetMapping("/project")
    public Page<Project> projectList(@RequestParam int page,
                                     @RequestParam int size,@RequestParam String Title,@RequestParam Boolean status){

        return projectService.findbyserandtitle(page,size,Title,status);
    }
    @GetMapping("user/project/{proj_id}")
    public Project projectbyid(@PathVariable int proj_id){
        Project project= projectService.projectbyid(proj_id);
        return project;
    }
    @PostMapping(value="user/project",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Project createproject(@RequestPart ProjectRequest projectRequest, @RequestParam MultipartFile file) throws IOException {
        String upload="/UserFiles";
        String filename=System.currentTimeMillis()+"_"+file.getOriginalFilename();
        Path path= Paths.get(upload,filename);
        Files.copy(file.getInputStream(),path);
        projectRequest.setFilename(filename);
        return projectService.createproject(projectRequest);
    }
    @DeleteMapping("project/{projectId}")
    public void deleteProject(@PathVariable int projectId) {
        projectService.deleteproject(projectId);
    }
    @GetMapping("/project/{id}/file")
    public ResponseEntity<Resource> getFile(
            @PathVariable int id
    ) throws MalformedURLException {

        Resource resource =
                projectService.getFile(id);

        return ResponseEntity.ok()
                .body(resource);
    }
}
