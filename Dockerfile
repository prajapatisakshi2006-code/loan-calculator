FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN javac LoanServer.java

CMD ["java", "LoanServer"]
