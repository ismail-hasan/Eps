import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useState } from "react";
import MainHeader from "../components/MainHeader";

const BASE_URL = "https://eps-backend.vercel.app";

export default function NavBook() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/book`);
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.log("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainHeader title="Book" subtitle1="" />

      <SafeAreaView
        className="flex-1 bg-gray-50"
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <View className="flex-1 px-2">

          <Text className="text-xl font-bold text-gray-900 mb-4 px-2">
            Select a Country
          </Text>

          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={books}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/BookLesson",
                      params: {
                        countryId: item.id,
                      },
                    })
                  }
                  className="flex-1 m-2 bg-white rounded-2xl items-center p-4 border border-gray-100 shadow-sm"
                >
                  <View className="w-16 h-11 rounded-lg overflow-hidden border border-gray-200 mb-3">
                    <Image
                      source={{ uri: item.flag }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>

                  <Text className="font-semibold text-gray-800 text-sm">
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )}

        </View>
      </SafeAreaView>
    </>
  );
}