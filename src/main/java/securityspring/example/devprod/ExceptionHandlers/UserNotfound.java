package securityspring.example.devprod.ExceptionHandlers;

public class UserNotfound extends RuntimeException {
    public UserNotfound(String message){
        super(message);
    }
}
