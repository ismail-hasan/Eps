import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
      ActivityIndicator,
      Image,
      SafeAreaView,
      ScrollView,
      Text,
      TouchableOpacity,
      useWindowDimensions,
      View
} from 'react-native';

const API_URL = 'https://react-bulk-backe-end.vercel.app/color';

const Colorblind = () => {
      const router = useRouter();
      const { width } = useWindowDimensions();

      const [shuffledQuiz, setShuffledQuiz] = useState([]);
      const [currentIndex, setCurrentIndex] = useState(0);
      const [selectedOption, setSelectedOption] = useState(null);
      const [score, setScore] = useState(0);
      const [showResult, setShowResult] = useState(false);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            fetchQuizData();
      }, []);

      const fetchQuizData = async () => {
            setLoading(true);
            try {
                  const response = await fetch(API_URL);
                  const data = await response.json();

                  const actualArray = Array.isArray(data)
                        ? data
                        : (data.data || Object.values(data));

                  generateRandomQuestions(actualArray);
            } catch (error) {
                  console.error("Data fetching error: ", error);
            } finally {
                  setLoading(false);
            }
      };

      const generateRandomQuestions = (quizData) => {
            if (!quizData || !Array.isArray(quizData) || quizData.length === 0) {
                  setShuffledQuiz([]);
                  return;
            }

            const randomized = [...quizData].sort(() => Math.random() - 0.5);
            setShuffledQuiz(randomized);
            setCurrentIndex(0);
            setSelectedOption(null);
            setScore(0);
            setShowResult(false);
      };

      if (loading || shuffledQuiz.length === 0) {
            return (
                  <SafeAreaView className="flex-1 bg-white justify-center items-center">
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text className="text-gray-500 mt-2">প্রশ্ন লোড হচ্ছে...</Text>
                  </SafeAreaView>
            );
      }

      const currentQuiz = shuffledQuiz[currentIndex];

      // ✅ KEY FIX: .answer ব্যবহার করা হচ্ছে, String convert করে compare
      const isCorrect = (option) => {
            return String(option).trim() === String(currentQuiz.answer).trim();
      };

      const handleSelect = (option) => {
            if (selectedOption !== null) return;
            setSelectedOption(option);
            if (isCorrect(option)) {
                  setScore(prev => prev + 1);
            }
      };

      const handleNext = () => {
            setSelectedOption(null);
            if (currentIndex < shuffledQuiz.length - 1) {
                  setCurrentIndex(prev => prev + 1);
            } else {
                  setShowResult(true);
            }
      };

      const getButtonClass = (option) => {
            if (selectedOption === null) return "bg-white border-gray-300";
            if (isCorrect(option)) return "bg-green-600 border-green-600";
            if (String(selectedOption).trim() === String(option).trim()) return "bg-red-600 border-red-600";
            return "bg-gray-100 border-gray-200 opacity-60";
      };

      const groupTextClass = (option) => {
            if (selectedOption === null) return "text-gray-800";
            if (isCorrect(option)) return "text-white";
            if (String(selectedOption).trim() === String(option).trim()) return "text-white";
            return "text-gray-400";
      };

      // ✅ FIX: API তে "Nothing is visible" আছে তাই সেটা match করা হচ্ছে
      const formatOptionText = (option) => {
            if (option === 'Nothing is visible') return 'কিছুই বুঝা যাচ্ছে না';
            if (option === 'Patient') return 'কোনো সংখ্যা নেই';
            return option;
      };

      const imageSize = width > 400 ? 220 : 180;

      return (
            <SafeAreaView className="flex-1 bg-white">

                  {/* HEADER */}
                  <View className="bg-blue-600 py-4 px-4 flex-row justify-between items-center">
                        <TouchableOpacity onPress={() => router.back()}>
                              <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <Text className="text-white text-lg font-bold">
                              কালার ব্লাইন্ডনেস টেস্ট
                        </Text>

                        <Ionicons name="information-circle-outline" size={24} color="white" />
                  </View>

                  {/* RESULT */}
                  {showResult ? (
                        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
                              <Text className="text-2xl font-bold text-gray-800">টেস্ট শেষ!</Text>
                              <Text className="text-lg mt-2 text-gray-600">
                                    স্কোর: {score} / {shuffledQuiz.length}
                              </Text>

                              <TouchableOpacity
                                    onPress={() => generateRandomQuestions(shuffledQuiz)}
                                    className="bg-blue-600 px-8 py-4 rounded-xl mt-6 w-full"
                              >
                                    <Text className="text-white text-center font-bold">
                                          আবার শুরু করুন
                                    </Text>
                              </TouchableOpacity>
                        </View>
                  ) : (
                        <ScrollView className="flex-1 bg-gray-50 px-5 py-6">

                              {/* QUESTION COUNTER */}
                              <Text className="text-gray-500">
                                    প্রশ্ন: {currentIndex + 1} / {shuffledQuiz.length}
                              </Text>

                              <Text className="text-lg font-bold mt-2 mb-4 text-gray-800">
                                    নিচের ছবিতে কত নম্বর দেখতে পাচ্ছেন?
                              </Text>

                              {/* IMAGE */}
                              <View className="bg-white p-6 rounded-2xl items-center mb-6 border border-gray-200">
                                    <Image
                                          source={{ uri: currentQuiz.image }}
                                          style={{ width: imageSize, height: imageSize }}
                                          resizeMode="contain"
                                    />
                              </View>

                              {/* OPTIONS */}
                              <View style={{ gap: 12 }}>
                                    {currentQuiz.options.map((option, index) => (
                                          <TouchableOpacity
                                                key={index}
                                                disabled={selectedOption !== null}
                                                onPress={() => handleSelect(option)}
                                                className={`py-3 px-4 rounded-xl border-2 ${getButtonClass(option)}`}
                                          >
                                                <Text className={`text-center font-bold text-base ${groupTextClass(option)}`}>
                                                      {formatOptionText(option)}
                                                </Text>
                                          </TouchableOpacity>
                                    ))}
                              </View>

                              {/* NEXT BUTTON */}
                              {selectedOption !== null && (
                                    <TouchableOpacity
                                          onPress={handleNext}
                                          className="bg-blue-600 py-4 rounded-xl mt-6 mb-10"
                                    >
                                          <Text className="text-white text-center font-bold text-base">
                                                {currentIndex === shuffledQuiz.length - 1
                                                      ? "ফলাফল দেখুন"
                                                      : "পরবর্তী প্রশ্ন →"}
                                          </Text>
                                    </TouchableOpacity>
                              )}

                        </ScrollView>
                  )}
            </SafeAreaView>
      );
};

export default Colorblind;