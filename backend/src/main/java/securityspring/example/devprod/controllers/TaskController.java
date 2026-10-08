package securityspring.example.devprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import securityspring.example.devprod.module.Task;
import securityspring.example.devprod.services.TaskService;
import securityspring.example.devprod.validmodule.TaskRequest;

import java.util.List;

@RestController
public class TaskController {
    @Autowired
    public TaskService taskService;

    @GetMapping("user/project/{proj_id}/task")
    public Page<Task> gettasksofproj(@PathVariable int proj_id, @RequestParam(required = false)Boolean status, @RequestParam(required = false)String tech, @RequestParam(defaultValue="0")int page, @RequestParam(defaultValue="5")int size){
    return taskService.tasksofproject(proj_id,status,tech,page,size);
    }
    @GetMapping("user/project/task/{task_id}")
    public Task gettaskbyid(@PathVariable int task_id){
     return  taskService.taskbyid(task_id);
    }
    @PostMapping("user/project/{proj_id}/task")
    public Task createTask(@RequestBody TaskRequest taskRequest, @PathVariable int proj_id){
        return taskService.createtask(taskRequest,proj_id);
    }
    @PatchMapping("user/project/task/{task_id}/toggle-status")
    public Task toggleTaskStatus(@PathVariable int task_id){
        return taskService.toggleTaskStatus(task_id);
    }
    @DeleteMapping("user/project/task/{task_id}")
    public void Deltetaskbyid(@PathVariable int task_id){
        taskService.DeleteTask(task_id);
    }
}
