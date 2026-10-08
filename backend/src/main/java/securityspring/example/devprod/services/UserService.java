package securityspring.example.devprod.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import securityspring.example.devprod.ExceptionHandlers.UserNotfound;
import securityspring.example.devprod.Securitydirectory.JWTService;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Userrepo;
import securityspring.example.devprod.validmodule.UserRequest;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private Userrepo userrepo;
    @Autowired
    private AuthenticationManager Authmanager;
    @Autowired
    private JWTService jwtService;
    private BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder(12);
     public String createuser(UserRequest userRequest){
         User user=new User();
         user.setUsername(userRequest.getUsername());
         user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
         user.setEmail(userRequest.getEmail());
         userrepo.save(user);
         return jwtService.generatetoken(user.getUsername());
     }
     public String Login(UserRequest userRequest){
         Authentication authentication=Authmanager.authenticate(new UsernamePasswordAuthenticationToken(userRequest.getUsername(),userRequest.getPassword()));
         if(authentication.isAuthenticated())return jwtService.generatetoken(userRequest.getUsername());
         return null;
     }

     public void deleteUser(int user_id){
         User user=userrepo.findById(user_id).orElseThrow(()->new UserNotfound("user not found "+user_id));
         userrepo.deleteById(user_id);
     }
}
