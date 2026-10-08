package securityspring.example.devprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.services.UserService;
import securityspring.example.devprod.validmodule.UserRequest;

@RestController
public class UserController {
    @Autowired
    private UserService userService;


    @PostMapping("/register")
    public String Register(@RequestBody UserRequest userRequest){

        return userService.createuser(userRequest);
    }
    @PostMapping("/login")
    public String Login(@RequestBody UserRequest userRequest){

        return userService.Login(userRequest);
    }
    @GetMapping("/user/me")
    public User getCurrentUser(){
        return userService.getCurrentUser();
    }
    @DeleteMapping("/Delete/{user_id}")
    public void deletetheuser(@PathVariable int user_id){
         userService.deleteUser(user_id);
    }
}
