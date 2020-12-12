package net.rosacorp.hytalemonitoring;

import net.rosacorp.hytalemonitoring.api.HytaleMonitoringAPI;
import net.rosacorp.hytalemonitoring.components.HytaleMonitoringPlayer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;

public class HytaleMonitoring {

    public static void main(String[] args) throws IOException {

        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {

                HytaleMonitoringAPI hytaleMonitoringAPI = new HytaleMonitoringAPI("d16e8ef5-9ba1-41ea-b0c2-916e4d851064");

                hytaleMonitoringAPI.addPlayer(new HytaleMonitoringPlayer("MrWormsy", "world", Math.random() * ((20) - (-20) + 1) + (-20), 0d, Math.random() * ((20) - (-20) + 1) + (-20)));
                hytaleMonitoringAPI.addPlayer(new HytaleMonitoringPlayer("Danuielle", "world", Math.random() * ((20) - (-20) + 1) + (-20), 0d, Math.random() * ((20) - (-20) + 1) + (-20)));
                hytaleMonitoringAPI.addPlayer(new HytaleMonitoringPlayer("oulet", "world", Math.random() * ((20) - (-20) + 1) + (-20), 0d, Math.random() * ((20) - (-20) + 1) + (-20)));

                try {
                    hytaleMonitoringAPI.sendData();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }, 0, 5000);
    }

}
