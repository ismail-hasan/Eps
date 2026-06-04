import { ScrollView, Text, View } from 'react-native';
import BottomNav from '../components/BottomNav';

const About = () => {
      // App Configuration Info
      const appVersion = "1.0.4";
      const developerName = "Coffee CoderX";
      const lastUpdated = "May 2026";

      return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50 mt-0">
                  <View className="flex-1 px-5 pt-1 justify-between">

                        {/* Top Header Section */}
                        <View className="items-center mt-6">
                              {/* EPS TOPIK Matching Logo Placeholder (Korean Flag Color Vibe) */}
                              <View className="w-24 h-24 bg-red-500 rounded-3xl items-center justify-center shadow-md mb-4 border-b-4 border-blue-700">
                                    <Text className="text-white text-3xl font-black">EPS</Text>
                              </View>
                              <Text className="text-3xl font-bold text-gray-800 tracking-wide">EPS TOPIK HERO</Text>
                              <Text className="text-blue-600 text-center font-medium mt-1">Your Trusted Companion for Korean Language Learning</Text>
                        </View>

                        {/* Info Cards Section */}
                        <View className="my-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

                              {/* App Version */}
                              <View className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium text-base">App Version</Text>
                                    <Text className="text-gray-800 font-semibold text-base">v{appVersion}</Text>
                              </View>

                              {/* Developer Info */}
                              <View className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium text-base">Developer</Text>
                                    <Text className="text-blue-600 font-semibold text-base">{developerName}</Text>
                              </View>

                              {/* Release Date */}
                              <View className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium text-base">Last Updated</Text>
                                    <Text className="text-gray-800 font-medium text-base">{lastUpdated}</Text>
                              </View>

                              {/* App Description */}
                              <View className="pt-5">
                                    <Text className="text-gray-700 leading-6 text-sm text-center">
                                          The EPS TOPIK HERO app is specially designed for candidates aspiring to work and study in South Korea under the EPS system. Here, you can easily prepare yourself using our comprehensive Korean vocabulary builder, extensive question banks, and simulated model tests.
                                    </Text>
                              </View>
                        </View>

                        {/* Footer Navigation Section */}
                        <View className="items-center mb-6">
                              <Text className="text-gray-400 text-xs mt-6">
                                    © {new Date().getFullYear()} EPS TOPIK HERO. All rights reserved.
                              </Text>
                        </View>

                  </View>
                  <BottomNav />
            </ScrollView>
      );
};

export default About;