// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.6.0"),
        .package(name: "CapacitorFilesystem", path: "../../../node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorPreferences", path: "../../../node_modules/@capacitor/preferences"),
        .package(name: "CapacitorSplashScreen", path: "../../../node_modules/@capacitor/splash-screen"),
        .package(name: "CordovaPluginBadge", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginBadge"),
        .package(name: "CordovaPluginDevice", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginDevice"),
        .package(name: "CordovaPluginFile", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginFile"),
        .package(name: "CordovaPluginLocalNotification", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginLocalNotification"),
        .package(name: "CordovaPluginXSocialsharing", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginXSocialsharing")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorPreferences", package: "CapacitorPreferences"),
                .product(name: "CapacitorSplashScreen", package: "CapacitorSplashScreen"),
                .product(name: "CordovaPluginBadge", package: "CordovaPluginBadge"),
                .product(name: "CordovaPluginDevice", package: "CordovaPluginDevice"),
                .product(name: "CordovaPluginFile", package: "CordovaPluginFile"),
                .product(name: "CordovaPluginLocalNotification", package: "CordovaPluginLocalNotification"),
                .product(name: "CordovaPluginXSocialsharing", package: "CordovaPluginXSocialsharing")
            ]
        )
    ]
)
