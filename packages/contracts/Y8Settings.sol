// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Y8Settings
/// @notice On-chain user settings for the Y8 platform, stored per wallet address.
contract Y8Settings {
    struct Settings {
        bool gpsEnabled;      // GPS location sharing
        bool activeDriver;    // Available for rideshare dispatch
        bool onlineStatus;    // Visible as online to others
        bool notifications;   // Push notifications enabled
        bool privacyMode;     // Hide profile from public discovery
        bool darkMode;        // App theme preference
        uint256 lastUpdated;  // Block timestamp of last update
    }

    mapping(address => Settings) private _settings;

    event SettingsUpdated(address indexed user, Settings settings);

    function updateSettings(
        bool gpsEnabled,
        bool activeDriver,
        bool onlineStatus,
        bool notifications,
        bool privacyMode,
        bool darkMode
    ) external {
        _settings[msg.sender] = Settings({
            gpsEnabled:    gpsEnabled,
            activeDriver:  activeDriver,
            onlineStatus:  onlineStatus,
            notifications: notifications,
            privacyMode:   privacyMode,
            darkMode:      darkMode,
            lastUpdated:   block.timestamp
        });
        emit SettingsUpdated(msg.sender, _settings[msg.sender]);
    }

    function getSettings(address user) external view returns (Settings memory) {
        return _settings[user];
    }
}
