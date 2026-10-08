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
import securityspring.example.devprod.ExceptionHandlers.ProjNotFound;
import securityspring.example.devprod.ExceptionHandlers.UnAuthorizedexception;
import securityspring.example.devprod.module.Project;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Projectrepo;
import securityspring.example.devprod.repositories.Userrepo;
import securityspring.example.devprod.services.ProjectService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceTest {

    @Mock
    private Projectrepo projectrepo;

    @Mock
    private Userrepo userrepo;
    @InjectMocks
    private ProjectService projectService;
    @BeforeEach
    void setup() {
        SecurityContextHolder.clearContext();
    }
    @Test
    void projectNotFound(){
        when(projectrepo.findById(1)).thenReturn(Optional.empty());

        assertThrows(ProjNotFound.class,()->projectService.projectbyid(1));
    }
    @Test
    void projectExists() {

        User user = new User();
        user.setUsername("shiva");

        Project project = new Project();
        project.setId(1);
        project.setUser(user);

        when(projectrepo.findById(1))
                .thenReturn(Optional.of(project));

        Authentication authentication =
                mock(Authentication.class);

        SecurityContext securityContext =
                mock(SecurityContext.class);

        when(authentication.getName())
                .thenReturn("shiva");

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        Project result =
                projectService.projectbyid(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
    }

    @Test
    void unauthorizedProjectAccess() {

        User owner = new User();
        owner.setUsername("owner");

        Project project = new Project();
        project.setId(1);
        project.setUser(owner);

        when(projectrepo.findById(1))
                .thenReturn(Optional.of(project));

        Authentication authentication =
                mock(Authentication.class);

        SecurityContext securityContext =
                mock(SecurityContext.class);

        when(authentication.getName())
                .thenReturn("otherUser");

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        assertThrows(
                UnAuthorizedexception.class,
                () -> projectService.projectbyid(1)
        );
    }


}
