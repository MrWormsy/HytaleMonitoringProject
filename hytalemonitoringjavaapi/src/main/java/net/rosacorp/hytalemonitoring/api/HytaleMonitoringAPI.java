package net.rosacorp.hytalemonitoring.api;

import com.google.gson.Gson;
import net.rosacorp.hytalemonitoring.HytaleMonitoring;
import net.rosacorp.hytalemonitoring.components.HytaleMonitoringPlayer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public class HytaleMonitoringAPI {

    private final String token;
    private ArrayList<HytaleMonitoringPlayer> players;

    public HytaleMonitoringAPI(String token) {
        this.token = token;
        this.players = new ArrayList<>();
    }

    // Send the data to the server
    public void sendData() throws IOException {
        Gson gson = new Gson();

        // Parse the data to JSON
        String playersJSON = gson.toJson(this.players);

        // Build the request
        String jsonRequest = gson.toJson(this);

        // The URL
        URL url = new URL("http://localhost:3000/api/sendData");

        // The HTTP connection
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        // We want to send a POST request
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        connection.setDoOutput(true);

        // Send the data to the server
        try(OutputStream os = connection.getOutputStream()) {
            byte[] input = jsonRequest.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        // Read the response
        try(BufferedReader br = new BufferedReader(
                new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder response = new StringBuilder();
            String responseLine = null;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
            System.out.println(response.toString());
        }
    }

    public ArrayList<HytaleMonitoringPlayer> getPlayers() {
        return players;
    }

    public void setPlayers(ArrayList<HytaleMonitoringPlayer> players) {
        this.players = players;
    }

    public void addPlayer(HytaleMonitoringPlayer player) {
        this.players.add(player);
    }
}
