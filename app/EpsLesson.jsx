import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// স্ক্রিনের উইডথ বা চওড়া কতটুকু তা জানার জন্য (ইমেজ রেসপন্সিভ করতে)
const { width } = Dimensions.get('window');

const EpsLesson = () => {
      const router = useRouter();
      // আগের পেজ থেকে পাঠানো প্যারামিটারগুলো রিসিভ করলাম
      const { title, lessonNo, images } = useLocalSearchParams();

      // স্ট্রিং আকারে আসা ইমেজ অ্যারে-কে আবার আসল জেসন অ্যারে-তে কনভার্ট করলাম
      const lessonImages = images ? JSON.parse(images) : [];

      return (
            <View className="flex-1 bg-white pt-12">
                  {/* হেডার ও ব্যাক বাটন */}
                  <View className="flex-row items-center px-4 pb-4 border-b border-gray-100">
                        <TouchableOpacity
                              onPress={() => router.back()}
                              className="p-2 bg-gray-100 rounded-full mr-3"
                        >
                              <Ionicons name="arrow-back" size={20} color="#374151" />
                        </TouchableOpacity>
                        <View className="flex-1">
                              <Text className="text-xs font-semibold text-indigo-600">Lesson {lessonNo}</Text>
                              <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                    {title}
                              </Text>
                        </View>
                  </View>

                  {/* লেসনের বইয়ের পাতা বা ইমেজগুলো স্ক্রল আকারে দেখানোর জন্য */}
                  <ScrollView className="flex-1 bg-gray-50">
                        {lessonImages && lessonImages.length > 0 ? (
                              <View className="p-4 items-center">
                                    {lessonImages.map((imgUrl, index) => (
                                          <View key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-4 overflow-hidden">
                                                <Image
                                                      source={{ uri: imgUrl }}
                                                      // ইমেজের সাইজ মোবাইল স্ক্রিনের উইডথ অনুযায়ী পারফেক্ট দেখানোর জন্য
                                                      style={{ width: width - 48, height: 500 }}
                                                      className="rounded-lg bg-gray-100"
                                                      resizeMode="contain" // পুরো বইয়ের পেজটা যেন কেটে না গিয়ে সুন্দরভাবে ফিট হয়
                                                />
                                                <Text className="text-center text-xs text-gray-400 mt-2">Page - {index + 1}</Text>
                                          </View>
                                    ))}
                              </View>
                        ) : (
                              <Text className="text-gray-500 text-center mt-10">এই লেসনে কোনো ছবি আপলোড করা নেই।</Text>
                        )}
                  </ScrollView>
            </View>
      );
};

export default EpsLesson;