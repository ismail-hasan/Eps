import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

const BASE_URL = "https://eps-backend.vercel.app";

// 🚀 গ্লোবাল মেমোরি ক্যাশ (একবার পুরো ডাটা ফেচ হলে এখানে জমা থাকবে)
let cachedAllBooks = null;

export default function BookLesson() {
  const { countryId } = useLocalSearchParams();

  // ⚡ যদি অলরেডি ক্যাশে ডাটা থাকে, তবে পেজে ঢোকার আগেই কান্ট্রি ফিল্টার করে স্টেট রেডি করে ফেলবে (০ সেকেন্ড লোডিং)
  const getInitialCountry = () => {
    if (cachedAllBooks) {
      return cachedAllBooks.find((c) => (c.id || c._id) === countryId) || null;
    }
    return null;
  };

  const [country, setCountry] = useState(getInitialCountry);
  const [loading, setLoading] = useState(!getInitialCountry()); // ⚡ ক্যাশ থাকলে স্পিনার দেখাবেই না

  useEffect(() => {
    fetchCountry();
  }, [countryId]);

  const fetchCountry = async () => {
    try {
      // 🔒 যদি ক্যাশে অলরেডি ডাটা থাকে, তবে নতুন করে fetch কলই করবে না!
      if (cachedAllBooks) {
        const found = cachedAllBooks.find((c) => (c.id || c._id) === countryId);
        setCountry(found || null);
        setLoading(false);
        return;
      }

      // ক্যাশ না থাকলে প্রথমবার শুধু নেটওয়ার্ক থেকে আনবে
      const res = await fetch(`${BASE_URL}/book`);
      const data = await res.json();

      cachedAllBooks = data; // গ্লোবাল ক্যাশ সেট করে রাখা হলো
      const found = data.find((c) => (c.id || c._id) === countryId);

      setCountry(found || null);
    } catch (err) {
      // console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const lessons = country?.lessons || [];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      
    >
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 bg-gray-100 px-3 py-1.5 rounded-lg"
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-800">
          {country?.name} - Lessons
        </Text>
      </View>

      {/* Lessons */}
      <View className="flex-1 p-4">
        <FlatList
          data={lessons}
          keyExtractor={(item) => (item.lessonId || item.id || "").toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() =>
                router.push({
                  pathname: "/LessonImages",
                  params: {
                    countryId,
                    lessonId: item.lessonId,
                    lessonTitle: item.title,
                  },
                })
              }
              className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center"
            >
              <Text className="font-medium text-gray-800 text-sm flex-1 pr-2">
                {item.title}
              </Text>

              <Text className="text-blue-500 font-bold text-lg">➔</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}