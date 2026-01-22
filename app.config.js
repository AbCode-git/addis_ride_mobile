export default {
    expo: {
        name: "Addis Ride Compare",
        slug: "addis-ride-compare",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "dark",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#000000"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true
        },
        android: {
            package: "com.addisride.compare",
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#000000"
            }
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            orsApiKey: process.env.ORS_API_KEY,
        }
    }
};
