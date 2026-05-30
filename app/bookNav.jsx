// app/NavBook.jsx

import { router } from "expo-router";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MainHeader from "../components/MainHeader";
import { booksData } from "./constants/data";

export default function NavBook() {
  return (
    <>
      <MainHeader
        title="Book"
        subtitle1="" />
      <SafeAreaView
        className="flex-1 bg-gray-50"
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <View className="flex-1 px-2 pt-">
          <Text className="text-xl font-bold text-gray-900 mb-4 px-2">
            Select a Country
          </Text>

          <FlatList
            data={booksData}
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
        </View>
      </SafeAreaView>
    </>
  );
}