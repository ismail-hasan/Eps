import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: "none" // ⚡ এটি সব স্ক্রিনের স্লাইড/ফেইড অ্যানিমেশন বন্ধ করে ইনস্ট্যান্ট ওপেন করবে
        }} 
      />
    </SafeAreaProvider>
  );
}