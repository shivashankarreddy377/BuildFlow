package securityspring.example.devprod.Securitydirectory;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Userrepo;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JWTService {
    private String secret="";
    @Autowired
    private Userrepo userrepo;
    public JWTService(){
        try{
            KeyGenerator keyGenerator=KeyGenerator.getInstance("HmacSHA256");
            SecretKey sk=keyGenerator.generateKey();
            secret= Base64.getEncoder().encodeToString(sk.getEncoded());
        }
        catch (NoSuchAlgorithmException e){
            throw new RuntimeException(e);
        }
    }
    public SecretKey getKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    public String generatetoken(String username) {
        User user = userrepo.findByUsername(username);
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        return Jwts.builder().setClaims(claims).setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis())).setExpiration(new Date((System.currentTimeMillis())+10*60*60*1000))
                .signWith(getKey()).compact();
    }
    public String extractusername(String token) {
        return extractclaims(token).getSubject();
    }
    public Claims extractclaims(String token){
        return Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(token).getBody();
    }
    public Date expirationtime(String token){
        return extractclaims(token).getExpiration();
    }
    public boolean validateToken(String token, UserDetails userDetails) {
        return (new Date().before(expirationtime(token))&&extractusername(token).equals(userDetails.getUsername()));
    }
}
