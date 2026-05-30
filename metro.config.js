const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind এর সাথে মেট্রো কনফিগারেশন কানেক্ট করা হচ্ছে
module.exports = withNativeWind(config, { input: "./global.css" });