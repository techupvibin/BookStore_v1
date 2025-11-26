# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the JAR file - using wildcard to avoid hardcoding artifact name
# Actual JAR name: BookStore_v1-0.0.1-SNAPSHOT.jar (from pom.xml artifactId)
COPY --from=build /app/target/*.jar app.jar

# Set environment variables for Spring Boot
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]