package securityspring.example.devprod.Securitydirectory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Userrepo;
@Service
public class Userdetailedservice implements UserDetailsService {
    @Autowired
    Userrepo userrepo;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user=userrepo.findByUsername(username);
        if(user==null){
            throw new UsernameNotFoundException(
                    "User not found"
            );
        }
        return new Userdetails(user);
    }
}
