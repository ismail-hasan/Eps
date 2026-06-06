import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";


import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MainHeader from "../components/MainHeader";

const BASE_URL = "https://eps-backend.vercel.app";

// 🚀 গ্লোবাল মেমোরি ক্যাশ ভ্যারিয়েবল (এটি কম্পোনেন্টের বাইরে থাকায় অ্যাপ চলাকালীন ডাটা একবার লোড হলে সেভ থাকবে)
let cachedBooksData = null;

export default function NavBook() {
  const [books, setBooks] = useState(cachedBooksData || []); // ⚡ যদি আগে থেকেই ক্যাশে ডাটা থাকে, তবে সরাসরি সেটা সেট হবে (০ সেকেন্ড লোডিং)
  const [loading, setLoading] = useState(!cachedBooksData);  // ⚡ ক্যাশে ডাটা থাকলে লোডিং স্পিনার দেখাবেই না

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/book`);
      const data = await res.json();

      // 🔒 ডাটা গ্লোবাল ক্যাশে সেভ করে রাখা হলো
      cachedBooksData = data;
      setBooks(data);
    } catch (err) {
      // console.log("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      {/* hello  */}
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}

      >
        <MainHeader title="Reading Hub" subtitle1="Keep learning, keep growing" cardIcon="book-outline" />
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
              keyExtractor={(item) => (item.id || item._id || "").toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/BookLesson",
                      params: {
                        countryId: item.id || item._id,
                      },
                    })
                  }
                  className="flex-1 m-2 bg-white rounded-2xl items-center p-4 border border-gray-100 shadow-sm"
                >
                  <View className="w-16 h-11 rounded-lg overflow-hidden border border-gray-200 mb-3">
                    <Image
                      source={{
                        uri: item.flag,
                        cache: "force-cache" // ⚡ ইমেজ বারবার লোড হওয়া বন্ধ করবে
                      }}
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