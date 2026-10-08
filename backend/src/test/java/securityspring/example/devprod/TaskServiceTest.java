package securityspring.example.devprod;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import securityspring.example.devprod.ExceptionHandlers.TaskNotfound;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.Task;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Projectrepo;
import securityspring.example.devprod.repositories.Taskrepo;
import securityspring.example.devprod.repositories.Userrepo;
import securityspring.example.devprod.services.TaskService;
import securityspring.example.devprod.validmodule.TaskRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {
    @Mock
    private Taskrepo taskrepo;

    @Mock
    private Projectrepo projectrepo;

    @Mock
    private Userrepo userrepo;

    @InjectMocks
    private TaskService taskService;

    @BeforeEach
    void setup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void taskNotFound() {

        when(taskrepo.findById(1))
                .thenReturn(Optional.empty());

        assertThrows(
                TaskNotfound.class,
                () -> taskService.taskbyid(1)
        );
    }

    @Test
    void createTaskSuccess() {

        User user = new User();
        user.setUsername("shiva");

        Project project = new Project();
        project.setUser(user);

        TaskRequest request = new TaskRequest();
        request.setTech("Spring");

        when(projectrepo.findById(1))
                .thenReturn(Optional.of(project));

        when(taskrepo.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Authentication authentication =
                mock(Authentication.class);

        SecurityContext securityContext =
                mock(SecurityContext.class);

        when(authentication.getName())
                .thenReturn("shiva");

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        Task task =
                taskService.createtask(request, 1);

        assertNotNull(task);

        verify(taskrepo)
                .save(any(Task.class));
    }
}
