package securityspring.example.devprod.module;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsResponse {
    private long totalProjects;
    private long completedProjects;
    private long pendingProjects;
    private double completionPercentage;
}
