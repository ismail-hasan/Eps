import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router'; // 👈 ১. রাউটার ইম্পোর্ট করুন
import { Text, TouchableOpacity, View } from 'react-native';

const MainHeader = ({
      title = "Quiz",
      subtitle1 = "নিজের জ্ঞান যাচাই করুন",
      subtitle2 = "নিজের জ্ঞান যাচাই করুন",
      leftIcon = "arrow-back",
      rightIcon = "help-circle-outline",
      cardIcon = "trophy",
      onLeftPress, // বাইরে থেকে দিলে সেটা কাজ করবে
      onRightPress
}) => {
      const router = useRouter(); // 👈 ২. রাউটার হুক কল করুন

      // ৩. বাইরে থেকে ফাংশন না দিলে ডিফল্টভাবে ব্যাক করবে
      const handleLeftPress = onLeftPress || (() => router.back());

      return (
            <>
                  {/* Top Navbar */}
                  <View className="bg-white px-5 pt-14 pb-4 flex-row items-center justify-between border-b border-gray-100">
                        <TouchableOpacity
                              onPress={handleLeftPress} // 👈 ৪. ফাংশনটি এখানে সেট করুন
                              className="p-1"
                        >
                              <Ionicons name={leftIcon} size={24} color="#1e293b" />
                        </TouchableOpacity>

                        <Text className="text-[#1e293b] text-xl font-bold flex-1 ml-5">
                              {title}
                        </Text>

                        <TouchableOpacity onPress={onRightPress} className="p-1" disabled={!onRightPress}>
                              <Ionicons name={rightIcon} size={24} color="#1e293b" />
                        </TouchableOpacity>
                  </View>

                  {/* Blue Banner Card */}
                  <View className="bg-blue-600 m-4 p-5 rounded-[24px] flex-row items-center justify-between shadow-sm">
                        <View className="flex-1 pr-4">
                              <Text className="text-white text-xl font-bold tracking-wide">
                                    {title} App
                              </Text>
                              <Text className="text-blue-100 text-xs mt-1 leading-4 opacity-90">
                                    {subtitle1}
                              </Text>
                              <Text className="text-blue-100 text-xs mt-1 leading-4 opacity-90">
                                    {subtitle2}
                              </Text>
                        </View>
                        <View className="w-12 h-12 bg-white/15 rounded-2xl items-center justify-center">
                              <Ionicons name={cardIcon} size={24} color="white" />
                        </View>
                  </View>
            </>
      );
};

export default MainHeader;