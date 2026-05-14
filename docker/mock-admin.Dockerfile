FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY mock-services/mock-admin-service/target/*.jar app.jar
EXPOSE 9003
ENTRYPOINT ["java", "-jar", "app.jar"]
