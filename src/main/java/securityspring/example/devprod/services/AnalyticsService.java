package securityspring.example.devprod.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import securityspring.example.devprod.module.AnalyticsResponse;
import securityspring.example.devprod.module.User;
import securityspring.example.devprod.repositories.Projectrepo;
import securityspring.example.devprod.repositories.Userrepo;

@Service
public class AnalyticsService {
    @Autowired
    private Projectrepo projectrepo;

    @Autowired
    private Userrepo userrepo;

    public AnalyticsResponse getAnalytics() {

        String username =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User user =
                userrepo.findByUsername(username);

        long total =
                projectrepo.countByUser(user);

        long completed =
                projectrepo.countByUserAndStatus(
                        user,
                        true
                );

        long pending =
                total - completed;

        double percentage = 0;

        if(total > 0){
            percentage =
                    ((double) completed / total) * 100;
            percentage =Math.round(percentage*100.0)/100.0;
        }

        return new AnalyticsResponse(
                total,
                completed,
                pending,
                percentage
        );
    }
}
