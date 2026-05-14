FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY sentinel-forensics-api/target/*.jar app.jar
EXPOSE 9001
ENTRYPOINT ["java", "-jar", "app.jar"]
