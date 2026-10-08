package securityspring.example.devprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.upload-dir:uploads}")
    private String uploadDirectory;

    @GetMapping("/project")
    public Page<Project> projectList(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size,
                                     @RequestParam(required = false) String Title,
                                     @RequestParam(required = false) Boolean status){
        return projectService.findbyserandtitle(page, size, Title, status);
    }

    @PatchMapping("user/project/{proj_id}/toggle-status")
    public Project toggleProjectStatus(@PathVariable int proj_id) {
        return projectService.toggleStatus(proj_id);
    }

    @GetMapping("user/project/{proj_id}")
    public Project projectbyid(@PathVariable int proj_id){
        Project project= projectService.projectbyid(proj_id);
        return project;
    }
    @PostMapping(value="user/project",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Project createproject(@RequestPart ProjectRequest projectRequest, @RequestParam MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDirectory);
        Files.createDirectories(uploadPath);
        String filename=System.currentTimeMillis()+"_"+file.getOriginalFilename();
        Path path= uploadPath.resolve(filename);
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
