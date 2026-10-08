package securityspring.example.devprod.ExceptionHandlers;

public class UnAuthorizedexception extends RuntimeException{
    public UnAuthorizedexception(String message){
        super(message);
    }
}
