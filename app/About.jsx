import { Link } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomNav from '../components/BottomNav';

const About = () => {
      // অ্যাপের প্রয়োজনীয় ইনফো
      const appVersion = "1.0.4";
      const developerName = "ISMAIL HASAN";
      const lastUpdated = "May 2026";

      return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50">
                  <View className="flex-1 px-5 py-10 justify-between">

                        {/* Top Header Section */}
                        <View className="items-center mt-6">
                              {/* EPS TOPIK এর সাথে ম্যাচিং লোগো প্লেসহোল্ডার (কোরিয়ান ফ্ল্যাগের কালার ভাইব) */}
                              <View className="w-24 h-24 bg-red-500 rounded-3xl items-center justify-center shadow-md mb-4 border-b-4 border-blue-700">
                                    <Text className="text-white text-3xl font-black">EPS</Text>
                              </View>
                              <Text className="text-3xl font-bold text-gray-800 tracking-wide">EPS TOPIK</Text>
                              <Text className="text-blue-600 font-medium mt-1">কোরিয়ান ভাষা শিক্ষার বিশ্বস্ত মাধ্যম</Text>
                        </View>

                        {/* Info Cards Section */}
                        <View className="my-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

                              {/* App Version */}
                              <View className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium text-base">অ্যাপ ভার্সন</Text>
                                    <Text className="text-gray-800 font-semibold text-base">v{appVersion}</Text>
                              </View>

                              {/* Developer Info */}
                              <View className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium text-base">ডেভেলপার</Text>
                                    <Text className="text-blue-600 font-semibold text-base">{developerName}</Text>
                              </View>

                              {/* Release Date */}
                              <View className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium text-base">সর্বশেষ আপডেট</Text>
                                    <Text className="text-gray-800 font-medium text-base">{lastUpdated}</Text>
                              </View>

                              {/* App Description */}
                              <View className="pt-5">
                                    <Text className="text-gray-700 leading-6 text-sm text-center">
                                          EPS TOPIK অ্যাপটি তৈরি করা হয়েছে বিশেষভাবে বোয়েসেল (BOESL) এর অধীনে কোরিয়া যাবার বাংলাদেশি ভাই-বোনদের জন্য। এখানে আপনি খুব সহজে কোরিয়ান শব্দার্থ, প্রশ্ন ব্যাংক এবং মডেল টেস্ট দিয়ে নিজেকে প্রস্তুত করতে পারবেন।
                                    </Text>
                              </View>
                        </View>

                        {/* Footer Navigation Section */}
                        <View className="items-center mb-6">
                            

                              <Text className="text-gray-400 text-xs mt-6">
                                    © {new Date().getFullYear()} EPS TOPIK Bangladesh. All rights reserved.
                              </Text>
                        </View>

                  </View>
                  <BottomNav></BottomNav>
            </ScrollView>
      );
};

export default About;