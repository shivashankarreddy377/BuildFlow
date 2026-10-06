package securityspring.example.devprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import securityspring.example.devprod.module.AnalyticsResponse;
import securityspring.example.devprod.services.AnalyticsService;
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {
    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    public AnalyticsResponse analytics(){

        return analyticsService.getAnalytics();
    }
}
