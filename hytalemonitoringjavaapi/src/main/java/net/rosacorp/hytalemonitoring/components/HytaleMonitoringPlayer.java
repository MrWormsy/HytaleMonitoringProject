package net.rosacorp.hytalemonitoring.components;

public class HytaleMonitoringPlayer {

    private String name;
    private String world;
    private int x;
    private int y;
    private int z;

    // We use int values not to have to handle the floating point
    public HytaleMonitoringPlayer(String name, String world, double x, double y, double z) {
        this.name = name;
        this.world = world;

        this.x = (int) x;
        this.y = (int) y;
        this.z = (int) z;
    }

}
