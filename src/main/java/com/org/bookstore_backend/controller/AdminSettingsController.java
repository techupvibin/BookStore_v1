package com.org.bookstore_backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminSettingsController {

    private static final Logger logger = LoggerFactory.getLogger(AdminSettingsController.class);

    // In-memory storage for settings (in production, use database)
    private static final Map<String, String> settings = new HashMap<>();

    static {
        // Initialize default settings
        settings.put("site.title", "Dream Books Library");
        settings.put("low.stock", "5");
        settings.put("maintenance", "false");
        settings.put("theme.default", "light");
        settings.put("notifications.enabled", "true");
    }

    /**
     * Get all admin settings
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getSettings() {
        logger.info("Admin requested settings");
        return ResponseEntity.ok(settings);
    }

    /**
     * Get a specific setting by key
     */
    @GetMapping("/{key}")
    public ResponseEntity<String> getSetting(@PathVariable String key) {
        logger.info("Admin requested setting: {}", key);
        String value = settings.get(key);
        if (value != null) {
            return ResponseEntity.ok(value);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Update settings
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, String> newSettings) {
        logger.info("Admin updating settings: {}", newSettings.keySet());
        
        // Update settings
        settings.putAll(newSettings);
        
        logger.info("Settings updated successfully");
        return ResponseEntity.ok(settings);
    }

    /**
     * Update a specific setting
     */
    @PutMapping("/{key}")
    public ResponseEntity<String> updateSetting(@PathVariable String key, @RequestBody String value) {
        logger.info("Admin updating setting: {} = {}", key, value);
        
        settings.put(key, value);
        
        logger.info("Setting updated successfully");
        return ResponseEntity.ok(value);
    }

    /**
     * Delete a setting
     */
    @DeleteMapping("/{key}")
    public ResponseEntity<Void> deleteSetting(@PathVariable String key) {
        logger.info("Admin deleting setting: {}", key);
        
        if (settings.remove(key) != null) {
            logger.info("Setting deleted successfully");
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.notFound().build();
    }

    /**
     * Reset all settings to defaults
     */
    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetSettings() {
        logger.info("Admin resetting all settings to defaults");
        
        // Reset to defaults
        settings.clear();
        settings.put("site.title", "Dream Books Library");
        settings.put("low.stock", "5");
        settings.put("maintenance", "false");
        settings.put("theme.default", "light");
        settings.put("notifications.enabled", "true");
        
        logger.info("Settings reset successfully");
        return ResponseEntity.ok(settings);
    }
}
