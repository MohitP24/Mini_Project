FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY sentinel-admin-api/target/*.jar app.jar
EXPOSE 9000
ENTRYPOINT ["java", "-jar", "app.jar"]
