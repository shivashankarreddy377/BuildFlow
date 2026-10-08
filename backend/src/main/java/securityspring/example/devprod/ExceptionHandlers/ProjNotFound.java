package securityspring.example.devprod.ExceptionHandlers;

public class ProjNotFound extends RuntimeException{
    public ProjNotFound(String message){
        super(message);
    }
}
