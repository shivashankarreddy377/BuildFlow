package securityspring.example.devprod.module;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @JoinColumn(name="project_id")
    private Project proj;
    private String title;
    private String description;
    private LocalDate due_date;
    private boolean status;
    private String tech;
}
