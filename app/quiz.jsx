import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import MainHeader from "../components/MainHeader.jsx";

// ১. প্রথমে একটি Query Client তৈরি করে নিলাম
const queryClient = new QueryClient();

// ২. API থেকে ডেটা আনার ফাংশন
const fetchQuizData = async () => {
  const response = await fetch("https://eps-backend.vercel.app/quiz");
  if (!response.ok) throw new Error("Network error");
  return response.json();
};

// ৩. র্যান্ডম প্রশ্ন সিলেক্ট করার ফাংশন
const getRandomQuestions = (data, count) => {
  return [...data].sort(() => Math.random() - 0.5).slice(0, count);
};

// ==========================================
// মূল কুইজ স্ক্রিন
// ==========================================
const QuizContent = () => {
  // TanStack Query দিয়ে ডেটা ফেচিং
  const { data: allQuestions, isLoading: isApiLoading, error } = useQuery({
    queryKey: ["quizData"],
    queryFn: fetchQuizData,
  });

  const [started, setStarted] = useState(false);
  const [quizList, setQuizList] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);

  const question = quizList[currentQuestion];

  const startQuiz = (count) => {
    if (!allQuestions) return;
    setQuizList(getRandomQuestions(allQuestions, count));
    setStarted(true);
  };

  const goNext = () => {
    if (currentQuestion + 1 < quizList.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleAnswer = (option) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(option);
    setShowCorrect(true);

    if (option === question.answer) {
      setScore((prev) => prev + 1);
    }
    setTimeout(() => goNext(), 1000);
  };

  useEffect(() => {
    if (!started || showResult) return;

    setTimeLeft(30);
    setAnswered(false);
    setSelectedAnswer("");
    setShowCorrect(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          Vibration.vibrate(400);
          setAnswered(true);
          setShowCorrect(true);
          setTimeout(() => goNext(), 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, started, showResult]);

  const restart = () => {
    setStarted(false);
    setQuizList([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setSelectedAnswer("");
  };

  return (
    // মূল ভিউ-কে SafeAreaView দিয়ে মুড়িয়ে দেওয়া হলো যেন নচ বা নিচের বারে কন্টেন্ট কেটে না যায়
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 justify-between">
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <MainHeader title="Quiz Zone" subtitle1="Test your knowledge and win" cardIcon="trophy" />

          {/* লোডিং স্টেট */}
          {isApiLoading && (
            <View className="m-4 bg-white p-10 rounded-2xl justify-center items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-3 font-semibold text-sm">Loading Questions...</Text>
            </View>
          )}

          {/* এরর স্টেট */}
          {error && (
            <View className="m-4 bg-red-50 p-6 rounded-2xl items-center">
              <Text className="text-red-600 font-bold">Failed to load quiz data</Text>
            </View>
          )}

          {/* কুইজ সেটআপ স্ক্রিন */}
          {!started && !isApiLoading && !error && (
            <View className="m-4 bg-white p-5 rounded-2xl shadow-sm">
              <Text className="text-base font-bold text-gray-800 mb-4 text-center">
                How many questions do you want to solve?
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {[5, 10, 20, 30].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => startQuiz(num)}
                    className="bg-blue-600 p-4 rounded-xl mb-4"
                    style={{ width: "47%" }}
                  >
                    <Text className="text-white text-center font-bold">{num} Questions</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* কুইজ খেলার স্ক্রিন */}
          {started && !showResult && question && (
            <View className="m-4 bg-white p-5 rounded-2xl shadow-sm">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="font-bold text-blue-600 text-xs">
                  QUESTION: {currentQuestion + 1}/{quizList.length}
                </Text>
                <Text className={`font-bold text-xs ${timeLeft <= 10 ? "text-red-600" : "text-green-600"}`}>
                  ⏱ {timeLeft}s
                </Text>
              </View>

              <Text className="text-lg font-bold text-gray-800 mb-6 leading-7">
                {question.question}
              </Text>

              {question.options?.map((option, i) => {
                const isCorrect = option === question.answer;
                const isWrong = showCorrect && selectedAnswer === option && option !== question.answer;

                return (
                  <TouchableOpacity
                    key={i}
                    disabled={answered}
                    onPress={() => handleAnswer(option)}
                    className={`p-4 rounded-xl mb-3 border ${showCorrect && isCorrect
                      ? "bg-green-500 border-green-600"
                      : isWrong
                        ? "bg-red-500 border-red-600"
                        : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <Text className={`font-semibold text-sm ${showCorrect && (isCorrect || isWrong) ? "text-white" : "text-gray-800"}`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* রেজাল্ট স্ক্রিন */}
          {showResult && (
            <View className="m-4 bg-white p-6 rounded-2xl items-center shadow-sm">
              <Ionicons name="trophy" size={64} color="#eab308" />
              <Text className="text-xl font-bold text-gray-800 mt-4">Quiz Complete!</Text>
              <Text className="text-5xl font-black text-blue-600 my-6">{score} / {quizList.length}</Text>
              <TouchableOpacity onPress={restart} className="bg-blue-600 px-8 py-3.5 rounded-xl w-full">
                <Text className="text-white font-bold text-center">Restart Quiz</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
};

// ৪. মূল এক্সপোর্ট
const QuizPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <QuizContent />
    </QueryClientProvider>
  );
};

export default QuizPage;