FROM openjdk:17-jdk-slim
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build -x test
ENTRYPOINT ["java", "-jar", "build/libs/beef-0.0.1-SNAPSHOT.jar"]