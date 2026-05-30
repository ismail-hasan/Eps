import { Text, View } from 'react-native'
import { Ionicons } from "@expo/vector-icons";

const header = () => {
      return (
            <View className="bg-blue-600 m-4 p-5 rounded-[24px] flex-row items-center justify-between shadow-sm">
                  <View className="flex-1 pr-4">
                        <Text className="text-white text-xl font-bold tracking-wide">
                              Quiz App
                        </Text>
                        <Text className="text-blue-100 text-xs mt-1 leading-4 opacity-90">
                              নিজের জ্ঞান যাচাই করুন
                        </Text>
                        <Text className="text-blue-100 text-xs mt-1 leading-4 opacity-90">
                              নিজের জ্ঞান যাচাই করুন
                        </Text>
                  </View>
                  <View className="w-12 h-12 bg-white/15 rounded-2xl items-center justify-center">
                        <Ionicons name="trophy" size={24} color="white" />
                  </View>
            </View>
      )
}

export default header