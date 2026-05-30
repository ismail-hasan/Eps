import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";

const features = [
  {
    id: 1,
    title: "EPS Book",
    subtitle: "Read all chapters",
    icon: <MaterialCommunityIcons name="book-open-variant" size={28} color="#2563eb" />,
    bg: "bg-blue-100",
  },
  {
    id: 2,
    title: "Quiz",
    subtitle: "Test knowledge",
    icon: <Ionicons name="help-circle" size={28} color="#7c3aed" />,
    bg: "bg-purple-100",
  },
  {
    id: 3,
    title: "Vocabulary",
    route: "/vocabulary",
    subtitle: "Important words",
    icon: <MaterialCommunityIcons name="format-list-bulleted" size={28} color="#ea580c" />,
    bg: "bg-orange-100",
  },
  {
    id: 4,
    title: "Color Blind",
    subtitle: "Full practice",
    icon: <Ionicons name="checkbox" size={28} color="#16a34a" />,
    bg: "bg-green-100",
    route: "/colorblind",
  },
  {
    id: 5,
    title: "UBT-TEST",
    route: "/ubtexam",
    subtitle: "Track journey",
    icon: <Ionicons name="bar-chart" size={28} color="#0284c7" />,
    bg: "bg-sky-100",
  },
  {
    id: 6,
    title: "About",
    subtitle: "Saved items",
    icon: <Ionicons name="star" size={28} color="#e11d48" />,
    bg: "bg-rose-100",
    route: "/About",

  },
];

const Home = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View className="bg-blue-900 px-5 pt-12 pb-8 rounded-b-3xl">
          {/* Top Bar */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity className="p-2 bg-blue-800 rounded-xl">
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-lg font-bold tracking-wider">
              EPS TOPIC
            </Text>

            <TouchableOpacity className="p-2 bg-blue-800 rounded-xl">
              <Ionicons name="moon-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Welcome Banner */}
          <View className="bg-blue-700 rounded-2xl p-5 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">
                Welcome to
              </Text>
              <Text className="text-white text-2xl font-black tracking-tight">
                EPS TOPIC HERO
              </Text>
              <Text className="text-blue-100 text-xs mt-2 leading-relaxed">
                Your complete solution for{"\n"}EPS-TOPIK preparation.
              </Text>
            </View>

            <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center">
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={40}
                color="white"
              />
            </View>
          </View>
        </View>

        {/* Main Body */}
        <View className="px-4 pt-6">
          {/* Explore Features Section */}
          <Text className="text-gray-800 text-base font-bold mb-4 px-1">
            Explore Features
          </Text>

          {/* 2-Column Grid */}
          <View className="flex-row flex-wrap justify-between">
            {features.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => item.route && router.push(item.route)}
                className="bg-white rounded-2xl p-5 mb-4 flex-row items-center border border-gray-100 shadow-sm"
                style={{ width: "48.5%" }}
              >
                <View className={`${item.bg} rounded-xl p-3 mr-3`}>
                  {item.icon}
                </View>

                <View className="flex-1">
                  <Text className="text-gray-800 text-sm font-bold" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Motivational Banner */}
          <View className="bg-purple-600 rounded-2xl mt-2 p-5 flex-row items-center">
            <View className="bg-yellow-400 rounded-xl p-2.5 mr-4">
              <FontAwesome5 name="trophy" size={18} color="#92400e" />
            </View>

            <View className="flex-1">
              <Text className="text-white font-bold text-sm ">
                Keep going!
              </Text>
              <Text className="text-purple-100 text-xs leading-4">
                Your hard work today will lead to success tomorrow.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView> 
  );
};

export default Home;