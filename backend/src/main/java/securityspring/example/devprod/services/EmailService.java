package securityspring.example.devprod.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendProjectCreatedMail(
            String to,
            String projectTitle) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Project Created");

        message.setText(
                "Project '" + projectTitle +
                        "' was created successfully."
        );
        try {
            mailSender.send(message);
        }
        catch (Exception e){
            throw new MailSendException("unable to send email");
        }


    }
}
