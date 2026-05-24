package com.hackclub.stickersrv;

import com.fren_gor.ultimateAdvancementAPI.UltimateAdvancementAPI;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Arrays;
import java.util.Objects;
import java.util.logging.Level;
import static spark.Spark.*;
import com.google.gson.Gson;

public final class Main extends JavaPlugin {
    private Gson gson = new Gson();
    UltimateAdvancementAPI api = UltimateAdvancementAPI.getInstance(this);
    @Override
    public void onEnable() {
        getConfig().options().copyDefaults();
        saveDefaultConfig();
        port(getConfig().getInt("api.port", 4500));
        get("/check/:name", (req, res) -> {
            res.type("application/json");
            String auth = req.headers("Authorization");
            if (!Objects.equals(auth.split("")[1], getConfig().getString("api.key", "abc123"))) {
                res.status(403);
                return gson.toJson("{ \"error\": \"unauthorized\", \"message\": \"You didn't provide an API key, or it is invalid.\" }");
            }
            try {
                Player player = (Player) getServer().getScheduler().callSyncMethod(this, () -> getServer().getPlayer(req.params("name")));
                boolean hasAdv = Objects.requireNonNull(api.getAdvancement(Objects.requireNonNull(getConfig().getString("advkey")))).isGranted(player);
                return gson.toJson("{ \"hasAdv\": " + hasAdv + " }");
            } catch (NullPointerException e) {
                res.status(500);
                getLogger().log(Level.SEVERE, Arrays.toString(e.getStackTrace()));
                return gson.toJson("{ \"error\": \"server\", \"message\": \"There was an error on the server, please check its console.\" }");
            }
        });
        getLogger().log(Level.INFO, "Started web server (port " + getConfig().getInt("api.port", 4500) + ")");
    }

    @Override
    public void onDisable() {
        getLogger().log(Level.INFO, "Stopping web server...");
        stop();
    }
}
