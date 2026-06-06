import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const SingleEpsBook = () => {
      const { id } = useLocalSearchParams(); 
      const router = useRouter();

      const [countryData, setCountryData] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            if (!id) return;
            setLoading(true);
            fetch(`https://eps-backend.vercel.app/country/${id}`)
                  .then((res) => res.json())
                  .then((data) => {
                        setCountryData(data);
                        setLoading(false);
                  })
                  .catch((err) => {
                        console.error("ডাটা লোড করতে সমস্যা হয়েছে:", err);
                        setLoading(false);
                  });
      }, [id]);

      return (
            <ScrollView className="flex-1 bg-gray-50 px-4 pt-12">
                  {/* হেডার ও ব্যাক বাটন */}
                  <View className="flex-row items-center mb-6">
                        <TouchableOpacity
                              onPress={() => router.back()}
                              className="p-2 bg-gray-200 rounded-full mr-3"
                        >
                              <Ionicons name="arrow-back" size={20} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">Lessons List</Text>
                  </View>

                  {/* লোডিং ইন্ডিকেটর */}
                  {loading ? (
                        <View className="flex-1 items-center justify-center pt-20">
                              <ActivityIndicator size="large" color="#4f46e5" />
                              <Text className="text-gray-500 mt-2">লেসন লোড হচ্ছে...</Text>
                        </View>
                  ) : countryData ? (
                        <View className="mb-10">
                              {/* দেশের নাম ও ফ্ল্যাগ ব্যানার */}
                              <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex-row items-center gap-4 mb-6">
                                    {countryData.flag && (
                                          <Image 
                                                source={{ uri: countryData.flag }} 
                                                className="w-16 h-11 rounded object-cover"
                                          />
                                    )}
                                    <View>
                                          <Text className="text-xl font-bold text-gray-900">{countryData.name}</Text>
                                          <Text className="text-xs text-gray-400">বুক লেসন সমূহ</Text>
                                    </View>
                              </View>

                              <Text className="text-base font-bold text-gray-700 mb-3 pl-1">সিলেক্ট করুন:</Text>

                              {/* লেসন লিস্ট */}
                              {countryData.lessons && countryData.lessons.length > 0 ? (
                                    countryData.lessons.map((lesson) => (
                                          <TouchableOpacity 
                                                key={lesson.lesson_no}
                                                // ক্লিক করলে EpsLesson স্ক্রিনে নিয়ে যাবে এবং কুয়েরি প্যারামিটারে টাইটেল ও ইমেজ পাস করবে
                                                onPress={() => router.push({
                                                      pathname: '/EpsLesson',
                                                      params: { 
                                                            title: lesson.lesson_title,
                                                            lessonNo: lesson.lesson_no,
                                                            // অ্যারে-কে স্ট্রিং বানিয়ে পাস করতে হয় Expo Router-এ
                                                            images: JSON.stringify(lesson.images) 
                                                      }
                                                })}
                                                activeOpacity={0.7}
                                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-3 flex-row justify-between items-center"
                                          >
                                                <View className="flex-1 pr-2">
                                                      <Text className="text-xs font-semibold text-indigo-600 mb-0.5">
                                                            Lesson {lesson.lesson_no}
                                                      </Text>
                                                      <Text className="text-base font-bold text-gray-800">
                                                            {lesson.lesson_title}
                                                      </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                          </TouchableOpacity>
                                    ))
                              ) : (
                                    <Text className="text-gray-500 text-center mt-4">কোনো লেসন পাওয়া যায়নি।</Text>
                              )}
                        </View>
                  ) : (
                        <View className="bg-red-50 p-5 rounded-2xl border border-red-200 items-center">
                              <Text className="text-red-600 font-semibold text-center">ডাটা রেকর্ড পাওয়া যায়নি!</Text>
                        </View>
                  )}
            </ScrollView>
      );
};

export default SingleEpsBook;