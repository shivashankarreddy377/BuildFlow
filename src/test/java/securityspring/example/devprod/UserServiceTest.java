package securityspring.example.devprod;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import securityspring.example.devprod.Securitydirectory.JWTService;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Userrepo;
import securityspring.example.devprod.services.UserService;
import securityspring.example.devprod.validmodule.UserRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private Userrepo userrepo;

    @Mock
    private AuthenticationManager authManager;

    @Mock
    private JWTService jwtService;

    @InjectMocks
    private UserService userService;

    @Test
    void registerUser() {

        UserRequest request = new UserRequest();
        request.setUsername("shiva");
        request.setPassword("123");

        when(jwtService.generatetoken("shiva"))
                .thenReturn("jwt-token");

        String token =
                userService.createuser(request);

        assertEquals("jwt-token", token);

        verify(userrepo)
                .save(any(User.class));
    }

    @Test
    void loginSuccess() {

        UserRequest request = new UserRequest();
        request.setUsername("shiva");
        request.setPassword("123");

        Authentication authentication =
                mock(Authentication.class);

        when(authentication.isAuthenticated())
                .thenReturn(true);

        when(authManager.authenticate(any()))
                .thenReturn(authentication);

        when(jwtService.generatetoken("shiva"))
                .thenReturn("jwt-token");

        String token =
                userService.Login(request);

        assertEquals("jwt-token", token);
    }
}
