package securityspring.example.devprod.validmodule;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
@Data
@AllArgsConstructor
@Setter
@Getter
@NoArgsConstructor
public class TaskRequest {
    @NotNull
    private String Title;

    private String description;
    @NotNull
    private LocalDate due_date;
    @NotNull
    private String Tech;
}
