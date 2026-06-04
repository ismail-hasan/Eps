import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

const BASE_URL = "https://eps-backend.vercel.app";

export default function BookLesson() {
  const { countryId } = useLocalSearchParams();

  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountry();
  }, []);

  const fetchCountry = async () => {
    try {
      const res = await fetch(`${BASE_URL}/book`);
      const data = await res.json();

      const found = data.find((c) => c.id === countryId);

      setCountry(found);
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
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
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
          keyExtractor={(item) => item.lessonId}
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
              <Text className="font-medium text-gray-800 text-sm">
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