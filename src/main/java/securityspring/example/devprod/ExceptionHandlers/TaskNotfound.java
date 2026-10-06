package securityspring.example.devprod.ExceptionHandlers;

public class TaskNotfound extends RuntimeException{
    public TaskNotfound(String message){
        super(message);
    }
}
