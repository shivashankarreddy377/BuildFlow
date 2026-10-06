package securityspring.example.devprod.validmodule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Data
@AllArgsConstructor
@Setter
@Getter
@NoArgsConstructor
public class UserRequest {
@NotBlank
    private String username;
@NotBlank
    private String password;

    private String email;
}
