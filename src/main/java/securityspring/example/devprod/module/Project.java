package securityspring.example.devprod.module;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;
    private boolean status;
    private String title;
    private String description;
    @CreatedDate
    private LocalDate created_at;
    private LocalDate due_date;
    @OneToMany(mappedBy = "proj",cascade=CascadeType.ALL)
    @JsonIgnore
    private List<Task>taskList;

    private String filename;
}
