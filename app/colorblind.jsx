import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
      ActivityIndicator,
      Image,
      ScrollView,
      Text,
      TouchableOpacity,
      useWindowDimensions,
      View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ১. প্রথমে একটি Query Client তৈরি করে নিলাম
const queryClient = new QueryClient();

const API_URL = "https://eps-backend.vercel.app/color";

// ২. API থেকে ডেটা নিয়ে আসার পিওর ফাংশন
const fetchColorQuizData = async () => {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();

      // ডেটা অ্যারে আকারে আছে কিনা তা নিশ্চিত করা
      return Array.isArray(data) ? data : data.data || Object.values(data);
};

// ==========================================
// মূল কালারব্লাইন্ড স্ক্রিন কন্টেন্ট
// ==========================================
const ColorblindContent = () => {
      const router = useRouter();
      const { width } = useWindowDimensions();

      // TanStack Query দিয়ে ডেটা ফেচিং (অটোমেটিক ক্যাশিং ও লোডিং হ্যান্ডেল করবে)
      const { data: serverQuizData, isLoading: isApiLoading, error } = useQuery({
            queryKey: ["colorQuizData"],
            queryFn: fetchColorQuizData,
            staleTime: 1000 * 60 * 10, // ১০ মিনিট ডেটা ক্যাশ থাকবে যাতে পেজ বারবার ওপেন করলেও স্লো না হয়
      });

      const [shuffledQuiz, setShuffledQuiz] = useState([]);
      const [currentIndex, setCurrentIndex] = useState(0);
      const [selectedOption, setSelectedOption] = useState(null);
      const [score, setScore] = useState(0);
      const [showResult, setShowResult] = useState(false);
      const [imageLoading, setImageLoading] = useState(true);

      // সার্ভার থেকে প্রথমবার ডেটা আসলে বা রিস্টার্ট দিলে প্রশ্নগুলো র্যান্ডমাইজ করার এফেক্ট
      useEffect(() => {
            if (serverQuizData && serverQuizData.length > 0) {
                  generateRandomQuestions(serverQuizData);
            }
      }, [serverQuizData]);

      // পরবর্তী প্রশ্নে গেলে ইমেজের লোডার রিসেট করার জন্য
      useEffect(() => {
            setImageLoading(true);
      }, [currentIndex]);

      const generateRandomQuestions = (quizData) => {
            const randomized = [...quizData].sort(() => Math.random() - 0.5);
            setShuffledQuiz(randomized);
            setCurrentIndex(0);
            setSelectedOption(null);
            setScore(0);
            setShowResult(false);
      };

      // এপিআই লোড হওয়া বা কোনো ডেটা না থাকার ইনিশিয়াল স্টেট চেক
      if (isApiLoading || shuffledQuiz.length === 0) {
            return (
                  <SafeAreaView style={{ flex: 1, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={{ color: "#6b7280", marginTop: 8 }}>Loading questions...</Text>
                  </SafeAreaView>
            );
      }

      const currentQuiz = shuffledQuiz[currentIndex];

      const isCorrect = (option) => {
            return String(option).trim() === String(currentQuiz?.answer).trim();
      };

      const handleSelect = (option) => {
            if (selectedOption !== null) return;
            setSelectedOption(option);
            if (isCorrect(option)) {
                  setScore((prev) => prev + 1);
            }
      };

      const handleNext = () => {
            setSelectedOption(null);
            if (currentIndex < shuffledQuiz.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
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

      const formatOptionText = (option) => {
            if (option === "Nothing is visible") return "Nothing is visible";
            if (option === "Patient") return "No numbers";
            return option;
      };

      const imageSize = width > 400 ? 220 : 180;

      return (
            <SafeAreaView className="flex-1 bg-white">
                  {/* HEADER */}
                  <View className="bg-blue-600 py-4 px-4 flex-row justify-between items-center mb-9">
                        <TouchableOpacity onPress={() => router.back()}>
                              <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-bold">Color blindness Test</Text>
                        <Ionicons name="information-circle-outline" size={24} color="white" />
                  </View>

                  {/* ERROR HANDLING */}
                  {error ? (
                        <View className="flex-1 justify-center items-center p-6">
                              <Ionicons name="alert-circle" size={48} color="#dc2626" />
                              <Text className="text-red-600 font-bold mt-2">Failed to load quiz data</Text>
                        </View>
                  ) : showResult ? (
                        /* RESULT SCREEN */
                        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
                              <Text className="text-2xl font-bold text-gray-800">Test Completed!</Text>
                              <Text className="text-lg mt-2 text-gray-600">
                                    Score: {score} / {shuffledQuiz.length}
                              </Text>

                              <TouchableOpacity
                                    onPress={() => generateRandomQuestions(serverQuizData)}
                                    className="bg-blue-600 px-8 py-4 rounded-xl mt-6 w-full"
                              >
                                    <Text className="text-white text-center font-bold">Restart Quiz</Text>
                              </TouchableOpacity>
                        </View>
                  ) : (
                        /* ACTIVE QUIZ SCREEN */
                        <ScrollView className="flex-1 bg-gray-50 px-5 py-6">
                              <Text className="text-gray-500">
                                    Question: {currentIndex + 1} / {shuffledQuiz.length}
                              </Text>

                              <Text className="text-lg font-bold mt-2 mb-4 text-gray-800">
                                    What number do you see in the image?
                              </Text>

                              {/* IMAGE CARD WITH LOADING SPIN */}
                              <View
                                    className="bg-white p-6 rounded-2xl items-center justify-center mb-6 border border-gray-200"
                                    style={{ minHeight: imageSize + 48 }}
                              >
                                    {imageLoading && (
                                          <View style={{ position: "absolute", zIndex: 1 }}>
                                                <ActivityIndicator size="small" color="#2563eb" />
                                          </View>
                                    )}

                                    {currentQuiz?.image && (
                                          <Image
                                                source={{ uri: currentQuiz.image }}
                                                style={{ width: imageSize, height: imageSize }}
                                                resizeMode="contain"
                                                onLoadStart={() => setImageLoading(true)}
                                                onLoadEnd={() => setImageLoading(false)}
                                          />
                                    )}
                              </View>

                              {/* OPTIONS */}
                              <View style={{ gap: 12 }}>
                                    {currentQuiz?.options?.map((option, index) => (
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
                                                {currentIndex === shuffledQuiz.length - 1 ? "View Results" : "Next Question →"}
                                          </Text>
                                    </TouchableOpacity>
                              )}
                        </ScrollView>
                  )}
            </SafeAreaView>
      );
};

// ৩. রুট এক্সপোর্ট: প্রোভাইডার দিয়ে মুড়িয়ে স্ক্রিন রিটার্ন করা
const Colorblind = () => {
      return (
            <QueryClientProvider client={queryClient}>
                  <ColorblindContent />
            </QueryClientProvider>
      );
};

export default Colorblind;