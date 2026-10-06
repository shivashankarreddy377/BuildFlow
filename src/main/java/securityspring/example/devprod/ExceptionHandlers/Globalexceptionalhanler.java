package securityspring.example.devprod.ExceptionHandlers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class Globalexceptionalhanler {
@ExceptionHandler(ProjNotFound.class)
    public ResponseEntity<String> projnotfound(ProjNotFound e){
    return ResponseEntity.status(404).body(e.getMessage());
}
@ExceptionHandler(UnAuthorizedexception.class)
    public ResponseEntity<String> unauhtorizede(UnAuthorizedexception e){
    return ResponseEntity.status(401).body(e.getMessage());
}
@ExceptionHandler(TaskNotfound.class)
    public ResponseEntity<String> tasknotex(TaskNotfound e){
    return ResponseEntity.status(404).body(e.getMessage());
}
@ExceptionHandler(UserNotfound.class)
    public ResponseEntity<String> usernotfound(UserNotfound e){
    return ResponseEntity.status(404).body(e.getMessage());
}
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(
            MethodArgumentNotValidException ex) {
        Map<String,String>errormp = Map.of();
       ex.getBindingResult().getFieldErrors().forEach(error->
               errormp.put(error.getField(), error.getDefaultMessage())
       );
        return ResponseEntity.badRequest().body(errormp);
    }
    @ExceptionHandler(MailSendException.class)
    public ResponseEntity<String> mailException(
            MailSendException e){

        return ResponseEntity
                .status(500)
                .body(e.getMessage());
    }
}
