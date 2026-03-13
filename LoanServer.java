import com.sun.net.httpserver.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;

public class LoanServer {

    public static void main(String[] args) throws Exception {

        HttpServer server = HttpServer.create(new InetSocketAddress(8000),0);

        server.createContext("/calculate", new LoanHandler());
        server.createContext("/", new FileHandler());

        server.setExecutor(null);
        server.start();

        System.out.println("Server running at http://localhost:8000");
    }

    static class LoanHandler implements HttpHandler {

        public void handle(HttpExchange exchange) throws IOException {

            URI uri = exchange.getRequestURI();
            String query = uri.getQuery();

            String[] params = query.split("&");

            double amount = Double.parseDouble(params[0].split("=")[1]);
            double rate = Double.parseDouble(params[1].split("=")[1]);
            int months = Integer.parseInt(params[2].split("=")[1]);

            double monthlyRate = rate / 12 / 100;

            double emi = (amount * monthlyRate * Math.pow(1+monthlyRate,months)) /
                         (Math.pow(1+monthlyRate,months)-1);

            double totalPayment = emi * months;
            double totalInterest = totalPayment - amount;

            String result = String.format("%.2f|%.2f|%.2f",emi,totalPayment,totalInterest);

            exchange.sendResponseHeaders(200,result.length());

            OutputStream os = exchange.getResponseBody();
            os.write(result.getBytes());
            os.close();
        }
    }

    static class FileHandler implements HttpHandler {

        public void handle(HttpExchange exchange) throws IOException {

            String path = exchange.getRequestURI().getPath();

            if(path.equals("/")){
                path = "/index.html";
            }

            File file = new File("public" + path);

            if(!file.exists()){
                String response = "File Not Found";
                exchange.sendResponseHeaders(404,response.length());
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
                return;
            }

            byte[] bytes;

try(FileInputStream fis = new FileInputStream(file)){
    bytes = fis.readAllBytes();
}

            exchange.sendResponseHeaders(200,bytes.length);

            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }
}