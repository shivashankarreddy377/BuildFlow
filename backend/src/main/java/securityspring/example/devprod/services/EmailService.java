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

        if (to == null || to.trim().isEmpty()) {
            return;
        }

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setTo(to);
            message.setSubject("Project Created");

            message.setText(
                    "Project '" + projectTitle +
                            "' was created successfully."
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Notice: Project created but email notification could not be sent: " + e.getMessage());
        }
    }
}
