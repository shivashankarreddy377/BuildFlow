package securityspring.example.devprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import securityspring.example.devprod.services.EmailService;

@RestController
public class MailController {
    @Autowired
    private EmailService emailService;

    @GetMapping("/test-mail")
    public String testMail() {

        emailService.sendProjectCreatedMail(
                "shiva1236795",
                "DPP Backend"
        );

        return "Mail Sent";
    }
}
