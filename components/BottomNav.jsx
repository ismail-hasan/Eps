import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 👈 সেফ এরিয়া ইনসেট ইमপোর্ট

const BottomNav = () => {
      const pathname = usePathname();
      const insets = useSafeAreaInsets(); // 👈 ফোনের নিচের সিস্টেম বারের হাইট নেওয়ার জন্য

      const tabs = [
            {
                  label: "Home",
                  icon: "home",
                  path: "/",
            },
            {
                  label: "Book",
                  icon: "book-outline",
                  path: "/bookNav",
            },
            {
                  label: "Quiz",
                  icon: "help-circle-outline",
                  path: "/quiz",
            },
            {
                  label: "Test",
                  icon: "document-text-outline",
                  path: "/ubtexam",
            },
            {
                  label: "About",
                  icon: "bar-chart-outline",
                  path: "/About",
            },
      ];

      return (
            <View
                  className="bg-white border-t border-gray-200 flex-row justify-around pt-3 px-2 shadow-lg"
                  style={{
                        // 🔒 ইনসেট ব্যবহার করে বটম প্যাডিং ডাইনামিক করা হলো। 
                        // যদি ফোনে গেসচার বার থাকে তবে সেটার স্পেস নিবে, নরমাল ফোনে ১২ পিক্সেল প্যাডিং নিবে।
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 12
                  }}
            >
                  {tabs.map((tab) => {
                        const active = pathname === tab.path;

                        return (
                              <TouchableOpacity
                                    key={tab.label}
                                    activeOpacity={0.7}
                                    onPress={() => router.push(tab.path)}
                                    className="items-center flex-1" // flex-1 দেওয়াতে টাচ এরিয়া বড় ও স্মুথ হবে
                              >
                                    <Ionicons
                                          name={tab.icon}
                                          size={22}
                                          color={active ? "#2563eb" : "#9ca3af"}
                                    />

                                    <Text
                                          className={`text-[11px] mt-1 ${active
                                                ? "text-blue-600 font-bold"
                                                : "text-gray-400 font-medium"
                                                }`}
                                    >
                                          {tab.label}
                                    </Text>
                              </TouchableOpacity>
                        );
                  })}
            </View>
      );
};

export default BottomNav;