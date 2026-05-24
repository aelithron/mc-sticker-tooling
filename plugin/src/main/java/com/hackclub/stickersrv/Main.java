package com.hackclub.stickersrv;

import com.fren_gor.ultimateAdvancementAPI.UltimateAdvancementAPI;
import org.bukkit.OfflinePlayer;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.logging.Level;
import static spark.Spark.*;
import com.google.gson.Gson;

public final class Main extends JavaPlugin {
    private Gson gson = new Gson();
    @Override
    public void onEnable() {
        UltimateAdvancementAPI api = UltimateAdvancementAPI.getInstance(this);
        getConfig().options().copyDefaults();
        saveDefaultConfig();
        port(getConfig().getInt("api.port", 4500));
        get("/check/:name", (req, res) -> {
            res.type("application/json");
            String auth = req.headers("Authorization");
            if (!Objects.equals(auth.split("Bearer ")[1], getConfig().getString("api.key", "abc123"))) {
                res.status(403);
                return gson.toJson(Map.of("error", "unauthorized", "message", "You didn't provide an API key, or it is invalid."));
            }
            try {
                OfflinePlayer player = getServer().getScheduler().callSyncMethod(this, () -> getServer().getOfflinePlayer(req.params("name"))).get();
                boolean hasAdv = Objects.requireNonNull(api.getAdvancement(Objects.requireNonNull(getConfig().getString("advkey")))).isGranted(player.getUniqueId());
                return gson.toJson(Map.of("hasAdv", hasAdv));
            } catch (NullPointerException e) {
                res.status(500);
                getLogger().log(Level.SEVERE, Arrays.toString(e.getStackTrace()));
                return gson.toJson(Map.of("error", "server", "message", "There was an error on the server, please check its console."));
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
