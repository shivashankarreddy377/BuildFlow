package securityspring.example.devprod.ExceptionHandlers;

public class MailSendException extends RuntimeException {
    public MailSendException(String message) {
        super(message);
    }
}
