package securityspring.example.devprod;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class DevprodApplication {

	public static void main(String[] args) {
		SpringApplication.run(DevprodApplication.class, args);
	}

}
