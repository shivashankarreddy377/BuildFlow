package securityspring.example.devprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import securityspring.example.devprod.services.AIService;
import securityspring.example.devprod.validmodule.AIRequest;
import securityspring.example.devprod.validmodule.AIResponse;

@RestController
@RequestMapping("/ai")
public class AIController {
 @Autowired
    private AIService aiService;
  @PostMapping("/generate-tasks")
    public AIResponse generate(@RequestBody AIRequest request){
      return aiService
              .generateTasks(
                      request.getProjectIdea()
              );
  }
}
