FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app/backend
COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN (mvn -B -DskipTests dependency:go-offline 2>/dev/null || (chmod +x mvnw 2>/dev/null && ./mvnw -B -DskipTests dependency:go-offline) || true)
COPY backend/src src
RUN mvn -B -DskipTests package || (chmod +x mvnw && ./mvnw -B -DskipTests package)

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /app/backend/target/devprod-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
