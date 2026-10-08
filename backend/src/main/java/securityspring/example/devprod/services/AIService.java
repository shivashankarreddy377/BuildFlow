package securityspring.example.devprod.services;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import securityspring.example.devprod.validmodule.AIResponse;

@Service
public class AIService {
    @Value("${gemini.api.key}")
    private String apikey;
    public AIResponse generateTasks(String projectIdea){
        return new AIResponse("Not implemented");
    }
}
