package securityspring.example.devprod.services;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import securityspring.example.devprod.validmodule.AIResponse;

import java.util.List;
import java.util.Map;

@Service
public class AIService {
    @Value("${gemini.api.key}")
    private String apikey;
    private final WebClient webClient =
            WebClient.builder().build();
    public AIResponse generateTasks(String projectIdea){
        String prompt = "Break down this software project into 5 clear development tasks with Title, Description, and Tech stack. Project Idea:\n" + projectIdea;
        Map<String,Object> body =
                Map.of(
                        "contents",
                        List.of(
                                Map.of(
                                        "parts",
                                        List.of(
                                                Map.of(
                                                        "text",
                                                        prompt
                                                )
                                        )
                                )
                        )
                );

        try {
            String response =
                    webClient.post()
                            .uri(
                                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                                            + apikey
                            )
                            .header("Content-Type", "application/json")
                            .bodyValue(body)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

            return new AIResponse(response);
        } catch (Exception e) {
            String fallback = "1. [Setup & Architecture] Initialize repo, design database schema, configure security & environment variables. (Tech: Spring Boot, MySQL, Docker)\n" +
                    "2. [Authentication & User Management] Implement JWT auth, user registration, login, and authorization guards. (Tech: Spring Security, JWT, React)\n" +
                    "3. [Core Feature API & Services] Build CRUD endpoints, business logic, validation, and error handlers for " + (projectIdea.length() > 30 ? projectIdea.substring(0, 30) + "..." : projectIdea) + ". (Tech: REST API, JPA Hibernate)\n" +
                    "4. [Frontend UI & Dashboard] Develop responsive UI components, state management, search/filter tables, and interactive forms. (Tech: React, Vite, CSS)\n" +
                    "5. [Testing & Deployment] Write automated integration tests, configure CI/CD pipeline, and prepare cloud deployment. (Tech: JUnit, GitHub Actions, Docker)";
            return new AIResponse(fallback);
        }
    }
}
