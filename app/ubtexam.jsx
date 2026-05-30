import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';

// ডেমো ডেটা: ২০টি Reading এবং ২০টি Listening (মোট ৪০টি কোশ্চেন)
const GENERATED_QUESTIONS = [
  // === READING SECTION (1 to 20) ===
  ...Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    return {
      id: id,
      type: 'reading',
      instruction: `[Reading Q${id}] 다음 그림을 보고 맞는 단어나 문장을 고르십시오.`,
      text: `${id}. 이 사진에 알맞은 한국어 단어는 무엇입니까?`,
      image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=400',
      options: ['가방 (Bag)', '상자 (Box)', '지갑 (Wallet)', '여권 (Passport)'],
      correctAnswer: 1
    };
  }),

  // === LISTENING SECTION (21 to 40) ===
  ...Array.from({ length: 20 }, (_, i) => {
    const id = i + 21;
    return {
      id: id,
      type: 'listening',
      instruction: `[Listening Q${id}] 잘 듣고 내용과 관계있는 그림을 고르십시오.`,
      text: `${id}. 질문을 듣고 알맞은 대답을 고르십시오.`,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400',
      options: ['한국어 (Korean)', '영어 (English)', '베트남어 (Vietnamese)', '네팔어 (Nepali)'],
      correctAnswer: 0
    };
  })
];

export default function UbtExamApp() {
  const [screenMode, setScreenMode] = useState('list');
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [questions, setQuestions] = useState([]);

  // এক্সাম স্টেট
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [showGridModal, setShowGridModal] = useState(false);

  // রেজাল্ট স্টেট
  const [scoreSummary, setScoreSummary] = useState({
    correct: 0,
    wrong: 0,
    unanswered: 0,
    totalMarks: 0
  });

  // 🔄 ওরিয়েন্টেশন কন্ট্রোল ও অটো-রিসেট
  useEffect(() => {
    async function handleOrientation() {
      if (screenMode === 'exam') {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    }

    handleOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [screenMode]);

  // টাইমার কাউন্টডাউন
  useEffect(() => {
    if (screenMode !== 'exam') return;
    if (timeLeft <= 0) {
      calculateResult();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, screenMode]);

  const startExam = (testId) => {
    setSelectedTestId(testId);
    setQuestions(GENERATED_QUESTIONS);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(50 * 60);
    setScreenMode('exam');
  };

  const calculateResult = () => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer === undefined) {
        unanswered++;
      } else if (userAnswer === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const totalMarks = correct * 5;
    setScoreSummary({ correct, wrong, unanswered, totalMarks });
    setScreenMode('result');
  };

  const handleExamSubmitTrigger = () => {
    Alert.alert("Submit Exam", "Are you sure you want to finish and submit your exam?", [
      { text: "Cancel", style: "cancel" },
      { text: "Submit", onPress: () => calculateResult() }
    ]);
  };

  const exitExam = () => {
    Alert.alert("Exit Exam", "Are you sure you want to quit? Your progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Exit", onPress: () => setScreenMode('list') }
    ]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQuestion = questions[currentIndex];

  /* ==================== SCREEN 1: MODEL TEST LIST (PORTRAIT) ==================== */
  if (screenMode === 'list') {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">

        <View className="bg-[#0080C0] p-5 items-center shadow-md">
          <Text className="text-white text-lg font-bold tracking-wide">EPS-TOPIK UBT Exams</Text>
        </View>

        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
          <View className="gap-3">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((id) => (
              <TouchableOpacity
                key={id}
                activeOpacity={0.7}
                onPress={() => startExam(id)}
                className="w-full bg-white rounded-xl px-5 py-4 border border-gray-200 shadow-sm flex-row justify-between items-center"
              >
                <Text className="text-gray-800 font-bold text-base">Model Test {id}</Text>
                <View className="bg-[#E4F0F8] px-3 py-1.5 rounded-lg flex-row items-center gap-1">
                  <Text className="text-[#0080C0] text-xs font-bold">Start</Text>
                  <Text className="text-[#0080C0] text-xs font-bold">➔</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ==================== SCREEN 2: RESULT SUMMARY (PORTRAIT) ==================== */
  if (screenMode === 'result') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-[#0080C0] p-5 items-center shadow-md">
          <Text className="text-white text-lg font-bold">Exam Result Scoreboard</Text>
          <Text className="text-blue-100 text-xs mt-1">Model Test {selectedTestId} Report</Text>
        </View>

        <ScrollView className="flex-1 p-5 gap-y-4">
          <View className="bg-white rounded-2xl p-6 items-center border border-gray-200 shadow-sm">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Score Obtained</Text>
            {/* 🛑 syntax error fixed in line below */}
            <Text className="text-5xl font-black text-[#0080C0] my-2 font-mono">{scoreSummary.totalMarks} <Text className="text-xl text-gray-500 font-normal">/ 200</Text></Text>
            <Text className="text-gray-500 text-xs">Each question carries 5 points</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm gap-y-3">
            <View className="flex-row justify-between items-center border-b border-gray-100 pb-2">
              <Text className="text-gray-600 font-medium text-sm">✅ Correct Answers</Text>
              <Text className="text-green-600 font-bold text-base">{scoreSummary.correct} / 40</Text>
            </View>
            <View className="flex-row justify-between items-center border-b border-gray-100 pb-2">
              <Text className="text-gray-600 font-medium text-sm">❌ Wrong Answers</Text>
              <Text className="text-red-500 font-bold text-base">{scoreSummary.wrong} / 40</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-medium text-sm">⚪ Unanswered</Text>
              <Text className="text-gray-400 font-bold text-base">{scoreSummary.unanswered} / 40</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setScreenMode('list')}
            className="bg-[#0080C0] p-4 rounded-xl items-center shadow mt-2"
          >
            <Text className="text-white font-bold text-sm">Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ==================== SCREEN 3: EXAM CORE (🔒 SAFE AREA LANDSCAPE VIEW) ==================== */
  return (
    <SafeAreaView className="flex-1 bg-gray-50 flex-col" edges={['top', 'bottom', 'left', 'right']}>
      {/* Top Bar */}
      <View className="bg-[#0080C0] px-8 py-2.5 flex-row justify-between items-center shadow-sm">
        <TouchableOpacity onPress={exitExam} className="bg-red-600 px-3 py-1 rounded">
          <Text className="text-white font-bold text-xs">✕ Exit</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-sm">
          Model Test: <Text className="text-yellow-300 font-mono text-base">{selectedTestId}</Text> | Remaining: <Text className="text-yellow-300 font-mono text-base">{formatTime(timeLeft)}</Text>
        </Text>
        <Text className="text-white font-bold text-sm">Free UBT - 01</Text>
      </View>

      {/* Main Panel */}
      <View className="flex-1 flex-row p-3 mx-2 gap-3">
        {/* Left Side: Question Frame */}
        <View className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-col">
          <View className="bg-[#E4F0F8] p-2.5 border-b border-gray-200 flex-row items-center">
            <View className="w-1.5 h-5 bg-[#0080C0] mr-2 rounded" />
            <Text className="text-gray-800 text-sm font-bold flex-1">{currentQuestion?.instruction}</Text>
          </View>

          <ScrollView className="flex-1 p-3" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-gray-800 text-sm font-semibold mb-2">{currentQuestion?.text}</Text>

            {currentQuestion?.type === 'listening' && (
              <View className="mb-2 bg-blue-50/80 p-2 rounded-lg border border-blue-200">
                <Text className="text-xs font-bold text-blue-700">🔊 Listening Audio Running... (Q21-Q40)</Text>
              </View>
            )}

            {currentQuestion?.image && (
              <View className="flex-1 border border-gray-200 rounded-lg p-1 bg-gray-50 items-center justify-center min-h-[120px]">
                <Image source={{ uri: currentQuestion.image }} className="w-full h-full min-h-[120px]" resizeMode="contain" />
              </View>
            )}
          </ScrollView>
        </View>

        {/* Right Side: Options Frame */}
        <View className="w-[38%] bg-white rounded-xl border border-gray-200 shadow-sm p-3 justify-center gap-2">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = answers[currentQuestion.id] === idx;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
                className={`w-full flex-row items-center p-2.5 rounded-lg border-2 ${isSelected ? 'border-[#0080C0] bg-[#E4F0F8]' : 'border-gray-200 bg-white'}`}
              >
                <View className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${isSelected ? 'bg-[#0080C0] border-[#0080C0]' : 'bg-white border-gray-300'}`}>
                  <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>{idx + 1}</Text>
                </View>
                <Text className="text-gray-700 font-medium text-xs flex-1">{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Nav */}
      <View className="bg-white border-t border-gray-200 px-8 py-3 mb-1 flex-row justify-between items-center shadow-md">
        <TouchableOpacity
          onPress={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className={`px-6 py-2 rounded-full ${currentIndex === 0 ? 'bg-gray-200' : 'bg-[#0080C0]'}`}
        >
          <Text className={`font-bold text-xs ${currentIndex === 0 ? 'text-gray-400' : 'text-white'}`}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowGridModal(true)} className="bg-[#0080C0] px-5 py-2 rounded-full">
          <Text className="text-white font-bold text-xs">📊 Total ({Object.keys(answers).length}/{questions.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1)}
          disabled={currentIndex === questions.length - 1}
          className={`px-6 py-2 rounded-full ${currentIndex === questions.length - 1 ? 'bg-gray-200' : 'bg-[#0080C0]'}`}
        >
          <Text className={`font-bold text-xs ${currentIndex === questions.length - 1 ? 'text-gray-400' : 'text-white'}`}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Modal */}
      <Modal visible={showGridModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/60 p-6">
          <View className="bg-white rounded-2xl p-4 w-[85%] max-h-[85%]">
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2 mb-3">
              <Text className="text-sm font-bold text-gray-800">Exam Progress Sheet (1-40)</Text>
              <TouchableOpacity onPress={() => setShowGridModal(false)}><Text className="text-gray-500 font-bold text-lg px-2">✕</Text></TouchableOpacity>
            </View>
            <ScrollView>
              <View className="flex-row flex-wrap gap-2 justify-start mb-4">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isActive = currentIndex === idx;
                  return (
                    <TouchableOpacity
                      key={q.id}
                      onPress={() => { setCurrentIndex(idx); setShowGridModal(false); }}
                      className={`w-[8%] p-2 rounded items-center border ${isActive ? 'border-blue-500 bg-blue-100' : ''} ${isAnswered ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-200'}`}
                    >
                      <Text className={`font-bold text-[10px] ${isAnswered ? 'text-white' : 'text-gray-700'}`}>{q.id}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setShowGridModal(false);
                  handleExamSubmitTrigger();
                }}
                className="w-full bg-red-500 p-2.5 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-xs">Finish & Submit Exam</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}