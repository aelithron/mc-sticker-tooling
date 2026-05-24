package com.hackclub.stickersrv;

import com.fren_gor.ultimateAdvancementAPI.UltimateAdvancementAPI;
import com.fren_gor.ultimateAdvancementAPI.advancement.Advancement;
import com.fren_gor.ultimateAdvancementAPI.util.AdvancementKey;
import org.bukkit.OfflinePlayer;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.java.JavaPlugin;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.logging.Level;
import static spark.Spark.*;
import com.google.gson.Gson;

public final class Main extends JavaPlugin {
    private Gson gson = new Gson();
    @Override
    public void onEnable() {
        Plugin hccore = getServer().getPluginManager().getPlugin("HCCore");
        assert hccore != null;
        UltimateAdvancementAPI api = UltimateAdvancementAPI.getInstance(hccore);
        getConfig().options().copyDefaults();
        saveDefaultConfig();
        port(getConfig().getInt("api.port", 4500));
        get("/check/:uuid", (req, res) -> {
            res.type("application/json");
            String auth = req.headers("Authorization");
            if (!Objects.equals(auth.split("Bearer ")[1], getConfig().getString("api.key", "abc123"))) {
                res.status(403);
                return gson.toJson(Map.of("error", "unauthorized", "message", "You did not provide an API key, or it is invalid."));
            }
            try {
                UUID.fromString(req.params("uuid"));
            } catch (IllegalArgumentException e) {
                res.status(400);
                return gson.toJson(Map.of("error", "uuid", "message", "The UUID you provided is not valid!"));
            }
            try {
                OfflinePlayer player = getServer().getScheduler().callSyncMethod(this, () -> getServer().getOfflinePlayer(UUID.fromString(req.params("uuid")))).get();
                Advancement adv = api.getAdvancement(new AdvancementKey(hccore, "diamonds"));
                assert adv != null;
                boolean hasAdv = adv.isGranted(player.getUniqueId());
                return gson.toJson(Map.of("hasAdv", hasAdv));
            } catch (Exception e) {
                res.status(500);
                getLogger().log(Level.SEVERE, "Error occurred when looking up UUID " + req.params("uuid") + ":\n" + e);
                Throwable cause = e.getCause();
                while (cause != null) {
                    getLogger().severe(cause.getMessage());
                    cause = cause.getCause();
                }
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
