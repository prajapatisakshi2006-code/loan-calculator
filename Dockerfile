FROM openjdk:17
WORKDIR /app
COPY . .
RUN javac LoanServer.java
CMD ["java", "LoanServer"]