import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

import BottomNav from "../components/BottomNav";
import MainHeader from "../components/MainHeader.jsx";

// =====================
// QUESTIONS DATA
// =====================
const quizData = [
  { id: 1, question: "দক্ষিণ কোরিয়ার রাজধানীর নাম কী?", options: ["সিউল", "বুসান", "টোকিও", "ঢাকা"], answer: "সিউল" },
  { id: 2, question: "EPS এর পূর্ণরূপ কী?", options: ["Employment Permit System", "Easy Permit System", "Employment People Service", "Employee Program System"], answer: "Employment Permit System" },
  { id: 3, question: "কোরিয়ার মুদ্রার নাম কী?", options: ["ডলার", "ওন", "ইয়েন", "রুপি"], answer: "ওন" },
  { id: 4, question: "বাংলাদেশের রাজধানী কী?", options: ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা"], answer: "ঢাকা" },
  { id: 5, question: "React Native কোন ভাষা?", options: ["Python", "Java", "JavaScript", "C++"], answer: "JavaScript" },
  { id: 6, question: "HTML কী?", options: ["Structure", "Design", "DB", "OS"], answer: "Structure" },
  { id: 7, question: "CSS কী?", options: ["Style", "Logic", "Backend", "DB"], answer: "Style" },
  { id: 8, question: "Node.js কী?", options: ["Runtime", "Browser", "OS", "Game"], answer: "Runtime" },
  { id: 9, question: "Git কী?", options: ["Version Control", "Design", "App", "DB"], answer: "Version Control" },
  { id: 10, question: "CPU কী?", options: ["Brain", "Memory", "Disk", "Screen"], answer: "Brain" },
  { id: 11, question: "RAM কী?", options: ["Memory", "CPU", "GPU", "Disk"], answer: "Memory" },
  { id: 12, question: "Internet কী?", options: ["Network", "Software", "Hardware", "App"], answer: "Network" },
  { id: 13, question: "API কী?", options: ["Interface", "OS", "DB", "Game"], answer: "Interface" },
  { id: 14, question: "MongoDB কী?", options: ["Database", "Language", "Framework", "Tool"], answer: "Database" },
  { id: 15, question: "React কী?", options: ["Library", "Database", "OS", "Tool"], answer: "Library" },
  { id: 16, question: "JS কী?", options: ["Language", "DB", "OS", "Game"], answer: "Language" },
  { id: 17, question: "Android Studio কী?", options: ["App Dev", "Game", "DB", "OS"], answer: "App Dev" },
  { id: 18, question: "HTTP কী?", options: ["Protocol", "Language", "Tool", "OS"], answer: "Protocol" },
  { id: 19, question: "HTTPS কী?", options: ["Secure Protocol", "Game", "App", "DB"], answer: "Secure Protocol" },
  { id: 20, question: "SQL কী?", options: ["Language", "OS", "Tool", "App"], answer: "Language" },
];

const getRandomQuestions = (count) => {
  return [...quizData].sort(() => Math.random() - 0.5).slice(0, count);
};

const QuizPage = () => {
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

  // =====================
  // START QUIZ
  // =====================
  const startQuiz = (count) => {
    setQuizList(getRandomQuestions(count));
    setStarted(true);
  };

  // =====================
  // NEXT QUESTION
  // =====================
  const goNext = () => {
    if (currentQuestion + 1 < quizList.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  // =====================
  // ANSWER HANDLER
  // =====================
  const handleAnswer = (option) => {
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(option);
    setShowCorrect(true);

    if (option === question.answer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      goNext();
    }, 1000);
  };

  // =====================
  // TIMER & AUTO NEXT
  // =====================
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

          setTimeout(() => {
            goNext();
          }, 1200);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, started, showResult]);

  // =====================
  // RESTART
  // =====================
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
    <View className="flex-1 bg-gray-100 justify-between">

      {/* WHITE TOP NAVIGATION BAR */}
      <View className="bg-white px-5 pt-14 pb-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-1"
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Text className="text-[#1e293b] text-xl font-bold flex-1 ml-5">
          Quiz
        </Text>

        <TouchableOpacity className="p-1">
          <Ionicons name="help-circle-outline" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

        {/* BLUE BANNER CARD */}
        <MainHeader />

        {/* QUIZ SETUP SCREEN */}
        {!started && (
          <View className="m-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <Text className="text-base font-bold text-gray-800 mb-4 text-center">
              কয়টি প্রশ্ন সমাধান করতে চান?
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {[5, 10, 20, 30].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => startQuiz(num)}
                  className="bg-blue-600 p-4 rounded-xl mb-4"
                  style={{ width: "47%" }}
                >
                  <Text className="text-white text-center font-bold">
                    {num} Questions
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {started && !showResult && question && (
          <View className="m-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-5">
              <View className="bg-blue-50 px-3 py-1.5 rounded-lg">
                <Text className="font-bold text-blue-600 text-xs">
                  QUESTION: {currentQuestion + 1}/{quizList.length}
                </Text>
              </View>

              <View className={`px-3 py-1.5 rounded-lg ${timeLeft <= 10 ? "bg-red-50" : "bg-green-50"}`}>
                <Text className={`font-bold text-xs ${timeLeft <= 10 ? "text-red-600" : "text-green-600"}`}>
                  ⏱ {timeLeft}s
                </Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-gray-800 mb-6 leading-7">
              {question.question}
            </Text>

            {question.options.map((option, i) => {
              const isCorrect = option === question.answer;
              const isWrong =
                showCorrect &&
                selectedAnswer === option &&
                option !== question.answer;

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
                  <Text
                    className={`font-semibold text-sm ${showCorrect && (isCorrect || isWrong) ? "text-white" : "text-gray-800"
                      }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* RESULT SCREEN */}
        {showResult && (
          <View className="m-4 bg-white p-6 rounded-2xl items-center shadow-sm border border-gray-100">
            <Ionicons name="trophy" size={64} color="#eab308" />
            <Text className="text-xl font-bold text-gray-800 mt-4">
              Quiz Complete!
            </Text>
            <Text className="text-sm text-gray-400 mt-1">আপনার অর্জিত স্কোর</Text>
            <Text className="text-5xl font-black text-blue-600 my-6">
              {score} / {quizList.length}
            </Text>
            <TouchableOpacity
              onPress={restart}
              className="bg-blue-600 px-8 py-3.5 rounded-xl w-full"
            >
              <Text className="text-white font-bold text-center">
                আবার শুরু করুন
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </View>
  );
};

export default QuizPage;