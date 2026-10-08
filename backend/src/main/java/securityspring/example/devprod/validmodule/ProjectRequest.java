package securityspring.example.devprod.validmodule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.nio.file.Path;
import java.time.LocalDate;
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectRequest {
    @NotBlank
    private String Title;
    @NotNull
    private LocalDate due_date;
    private String description;
    private String filename;


}
