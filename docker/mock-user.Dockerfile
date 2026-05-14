FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY mock-services/mock-user-service/target/*.jar app.jar
EXPOSE 9002
ENTRYPOINT ["java", "-jar", "app.jar"]
