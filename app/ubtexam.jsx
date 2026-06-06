import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Audio } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

// ─── QueryClient ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = "https://eps-backend.vercel.app/epsexam";
const EXAM_DURATION = 50 * 60;
const READING_COUNT = 20;
const LISTENING_COUNT = 20;
const TOTAL = 40;
const AVAILABLE_TESTS = Array.from({ length: 10 }, (_, i) => i + 1);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (s) => {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
};

const normalise = (raw, id) => {
  const arr =
    raw?.exam ??
    (Array.isArray(raw) ? raw : raw?.questions ?? raw?.data ?? null);
  if (!arr?.length) return null;
  return {
    id,
    questions: arr.map((q) => ({
      id: q.qNumber,
      type: q.qNumber > READING_COUNT ? "listening" : "reading",
      instruction: q.instruction ?? "",
      question: q.question ?? "",
      image: q.image ?? null,
      audio: q.audio ?? null,
      options: (q.options ?? []).map((t, i) => ({ id: i + 1, text: String(t) })),
      correct: typeof q.correctAnswer === "number" ? q.correctAnswer + 1 : null,
    })),
  };
};

// ─── FETCH ────────────────────────────────────────────────────────────────────
const fetchTestList = async () => AVAILABLE_TESTS;

const fetchExam = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  const data = normalise(raw, id);
  if (!data) throw new Error("empty");
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — Loading spinner
// ─────────────────────────────────────────────────────────────────────────────
function LoadingView({ text = "Loading…", dark = false }) {
  return (
    <View className={`flex-1 items-center justify-center gap-4 ${dark ? "bg-blue-800" : "bg-blue-50"}`}>
      <ActivityIndicator size="large" color={dark ? "#fff" : "#1565C0"} />
      <Text className={`text-sm font-bold tracking-wide ${dark ? "text-white/80" : "text-blue-700"}`}>
        {text}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — Not found / error
// ─────────────────────────────────────────────────────────────────────────────
function NotFoundView({ message = "Could not load data.", onBack }) {
  return (
    <View className="flex-1 bg-blue-50 items-center justify-center px-8">
      <Text className="text-6xl mb-4">😕</Text>
      <Text className="text-lg font-black text-slate-800 text-center">Not Found</Text>
      <Text className="text-sm text-slate-500 mt-2 text-center leading-5">{message}</Text>
      {onBack && (
        <TouchableOpacity onPress={onBack} className="mt-6 bg-blue-800 rounded-xl px-8 py-3">
          <Text className="text-white font-extrabold text-sm">← Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — Image with loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function ExamImage({ uri, width, height }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <View
      style={{ width, height }}
      className="rounded-xl overflow-hidden border border-blue-100 mb-3 bg-blue-100"
    >
      {/* Skeleton shimmer — shows while loading */}
      {!loaded && !error && (
        <View className="absolute inset-0 items-center justify-center bg-blue-100">
          <ActivityIndicator size="small" color="#1565C0" />
        </View>
      )}

      {/* Error state */}
      {error && (
        <View className="absolute inset-0 items-center justify-center bg-slate-100">
          <Text className="text-2xl">🖼️</Text>
          <Text className="text-xs text-slate-400 mt-1">Image unavailable</Text>
        </View>
      )}

      {/* Actual image — always mounted so onLoad fires */}
      {!error && (
        <Image
          source={{ uri }}
          style={{ width, height, opacity: loaded ? 1 : 0 }}
          resizeMode="cover"
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setError(true); }}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function AudioBtn({ url }) {
  const [snd, setSnd] = useState(null);
  const [st, setSt] = useState("idle");

  useEffect(() => () => { snd?.unloadAsync(); }, [snd]);

  const press = async () => {
    if (st === "playing" && snd) {
      await snd.stopAsync();
      await snd.unloadAsync();
      setSnd(null); setSt("idle");
      return;
    }
    try {
      setSt("loading");
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync({ uri: url });
      setSnd(s); setSt("playing");
      await s.playAsync();
      s.setOnPlaybackStatusUpdate((x) => {
        if (x.didJustFinish) { s.unloadAsync(); setSnd(null); setSt("idle"); }
      });
    } catch {
      setSt("idle");
      Alert.alert("Audio Error", "Cannot play this audio.");
    }
  };

  const playing = st === "playing";
  const loading = st === "loading";

  return (
    <TouchableOpacity
      onPress={press}
      disabled={loading}
      className={`flex-row items-center self-start gap-2 rounded-lg px-4 py-2.5 mb-3 border ${playing ? "bg-blue-700 border-blue-700" : "bg-blue-50 border-blue-200"
        }`}
    >
      {loading
        ? <ActivityIndicator size="small" color="#1565C0" />
        : <Text className="text-base">{playing ? "⏹" : "▶"}</Text>}
      <Text className={`text-sm font-bold ${playing ? "text-white" : "text-blue-800"}`}>
        {loading ? "Loading…" : playing ? "Stop" : "Play Audio"}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function HomeScreen({ onStart }) {
  const insets = useSafeAreaInsets();
  const { data: tests, isLoading, isError } = useQuery({
    queryKey: ["testList"],
    queryFn: fetchTestList,
    staleTime: Infinity,
  });

  return (
    <View className="flex-1 bg-blue-50">
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Header — top safe area inside header bg */}
      <View className="bg-blue-800 px-5 pb-5" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-white/60 text-xs font-bold tracking-widest">EPS-TOPIK</Text>
        <Text className="text-white text-2xl font-black mt-0.5">UBT Model Tests</Text>
        <Text className="text-white/55 text-xs mt-1">
          40 Questions · 50 Minutes · Reading & Listening
        </Text>
      </View>

      {isLoading ? (
        <LoadingView text="Fetching available tests…" />
      ) : isError || !tests?.length ? (
        <NotFoundView message={"Could not load test list.\nPlease check your connection."} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Text className="text-xs font-bold text-slate-500 tracking-widest mb-3 mt-1">
            AVAILABLE TESTS
          </Text>

          {tests.map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => onStart(n)}
              activeOpacity={0.75}
              className="bg-white rounded-xl mb-2 flex-row items-center py-3.5 px-4 border border-blue-100"
            >
              <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3.5">
                <Text className="text-base font-black text-blue-800">{n}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-800">Model Test {n}</Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Reading (1–20) · Listening (21–40)
                </Text>
              </View>
              <View className="bg-blue-800 rounded-lg px-4 py-2">
                <Text className="text-white font-bold text-sm">Start →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
function NavModal({ visible, questions, answered, currentIdx, onJump, onClose, onSubmit }) {
  const insets = useSafeAreaInsets();
  const answeredCount = Object.keys(answered).length;
  const unanswered = questions.length - answeredCount;

  const sections = [
    { label: "📖 Reading", start: 0, end: READING_COUNT - 1 },
    { label: "🎧 Listening", start: READING_COUNT, end: TOTAL - 1 },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/45 justify-end">
        <View
          className="bg-white rounded-t-2xl p-5"
          style={{ maxHeight: "82%", paddingBottom: insets.bottom + 16 }}
          onStartShouldSetResponder={() => true}
        >
          <View className="w-9 h-1 bg-blue-100 rounded-full self-center mb-4" />

          <View className="flex-row justify-between items-center mb-3.5">
            <Text className="text-base font-extrabold text-slate-800">Question Overview</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-xl text-slate-500">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2 bg-blue-50 rounded-xl p-2.5 mb-4 items-center">
            <Text className="text-sm font-bold text-blue-800">
              {answeredCount} / {questions.length} answered
            </Text>
            {unanswered > 0 && (
              <Text className="text-xs text-slate-500">· {unanswered} remaining</Text>
            )}
          </View>

          <View className="flex-row gap-4 mb-3.5">
            {[
              { cls: "bg-blue-800 border-blue-800", label: "Current" },
              { cls: "bg-green-700 border-green-700", label: "Answered" },
              { cls: "bg-slate-100 border-slate-400", label: "Unanswered" },
            ].map((l) => (
              <View key={l.label} className="flex-row items-center gap-1">
                <View className={`w-3 h-3 rounded-sm border ${l.cls}`} />
                <Text className="text-xs text-slate-500">{l.label}</Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sections.map((sec) => (
              <View key={sec.label} className="mb-4">
                <Text className="text-xs font-bold text-slate-500 mb-2">{sec.label}</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {questions.slice(sec.start, sec.end + 1).map((q, i) => {
                    const idx = sec.start + i;
                    const isAns = answered[q.id] !== undefined;
                    const isCur = idx === currentIdx;
                    return (
                      <TouchableOpacity
                        key={q.id}
                        onPress={() => { onJump(idx); onClose(); }}
                        className={`w-10 h-10 rounded-lg items-center justify-center border ${isCur
                            ? "bg-blue-800 border-blue-800"
                            : isAns
                              ? "bg-green-700 border-green-700"
                              : "bg-slate-100 border-slate-400"
                          }`}
                      >
                        <Text className={`text-xs font-bold ${isCur || isAns ? "text-white" : "text-slate-500"}`}>
                          {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => { onClose(); onSubmit(); }}
            className="bg-blue-800 rounded-xl p-3.5 items-center mt-3"
          >
            <Text className="text-white font-extrabold text-sm">
              Submit Exam ({answeredCount}/{questions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM SUBMIT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmModal({ visible, answered, total, onReview, onConfirm }) {
  const cnt = Object.keys(answered).length;
  const left = total - cnt;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onReview}>
      <View className="flex-1 bg-black/50 justify-center px-6">
        <View className="bg-white rounded-2xl p-6 items-center">
          <Text className="text-4xl">📝</Text>
          <Text className="text-lg font-black text-slate-800 mt-2.5">Submit Exam?</Text>
          <Text className="text-slate-500 text-sm mt-1.5 text-center">
            {cnt} of {total} questions answered.
          </Text>
          {left > 0 && (
            <View className="bg-amber-50 rounded-lg p-2.5 mt-3 w-full">
              <Text className="text-orange-700 font-bold text-center text-xs">
                ⚠️  {left} question{left > 1 ? "s" : ""} unanswered
              </Text>
            </View>
          )}
          <View className="flex-row gap-2.5 mt-4 w-full">
            <TouchableOpacity onPress={onReview} className="flex-1 bg-slate-100 rounded-xl p-3 items-center">
              <Text className="font-bold text-slate-500">Review</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} className="flex-1 bg-blue-800 rounded-xl p-3 items-center">
              <Text className="font-extrabold text-white">Submit ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function ExamScreen({ examData, onSubmit, onExit }) {
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [navVisible, setNavVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Responsive image size — recalculate on dimension change
  const [dims, setDims] = useState(Dimensions.get("window"));
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => setDims(window));
    return () => sub?.remove();
  }, []);

  const qs = examData.questions;
  const q = qs[idx];
  const answeredCount = Object.keys(answered).length;
  const isUrgent = timeLeft < 300;

  // Image size = ~45% of left column width, capped
  const imgW = Math.min(Math.floor(dims.width * 0.45), 300);
  const imgH = Math.round(imgW * 0.65);

  // Lock landscape during exam
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    StatusBar.setHidden(true);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      StatusBar.setHidden(false);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(t); onSubmit(answered); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pick = useCallback((qId, optId) => {
    setAnswered((p) => ({ ...p, [qId]: optId }));
  }, []);

  const doSubmit = () => {
    setConfirmVisible(false);
    onSubmit(answered);
  };

  return (
    <View className="flex-1 bg-white">

      {/* Top bar — left/right safe area + custom top padding (landscape) */}
      <View
        className="bg-blue-800 flex-row items-center shadow-md"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          paddingLeft: insets.left + 14,
          paddingRight: insets.right + 14,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Exit Exam?", "Your progress will be lost.", [
              { text: "Cancel" },
              { text: "Exit", style: "destructive", onPress: onExit },
            ])
          }
          className="bg-red-700 rounded-md px-3 py-1.5"
        >
          <Text className="text-white font-bold text-xs">✕ Exit</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-white font-extrabold text-sm">
            {"Model Test: "}
            <Text>{examData.id}</Text>
            {"   "}
            <Text className="text-white/65 font-normal text-xs">Remaining: </Text>
            <Text className={`font-black ${isUrgent ? "text-red-300" : "text-yellow-300"}`}>
              {fmt(timeLeft)}
            </Text>
          </Text>
        </View>

        <Text className="text-white/65 text-xs font-semibold">
          Free UBT - {String(examData.id).padStart(2, "0")}
        </Text>
      </View>

      {/* 2-column body — honour left/right insets */}
      <View
        className="flex-1 flex-row"
        style={{ paddingLeft: insets.left, paddingRight: insets.right }}
      >
        {/* LEFT — question */}
        <View className="flex-1 border-r border-blue-100">

          {/* Instruction bar */}
          <View className="bg-blue-50 px-4 py-2.5 border-b border-blue-100 flex-row items-start gap-2">
            <View className="w-0.5 rounded-sm bg-blue-700 self-stretch" />
            <Text className="text-sm font-bold text-blue-800 flex-1 leading-5">
              {q.instruction}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            key={idx}
          >
            <Text className="text-sm text-slate-800 mb-3 leading-6">
              <Text className="font-extrabold">{idx + 1}. </Text>
              {q.question}
            </Text>

            {/* Responsive image with loading skeleton */}
            {q.image && (
              <ExamImage uri={q.image} width={imgW} height={imgH} />
            )}

            {q.type === "listening" && q.audio && <AudioBtn url={q.audio} />}
          </ScrollView>
        </View>

        {/* RIGHT — options */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 14, gap: 8 }}
          showsVerticalScrollIndicator={false}
          key={`o-${idx}`}
        >
          {q.options.map((opt) => {
            const sel = answered[q.id] === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => pick(q.id, opt.id)}
                activeOpacity={0.8}
                className={`flex-row items-center rounded-xl py-3 px-3.5 border ${sel
                    ? "border-2 border-blue-600 bg-blue-50"
                    : "border border-blue-100 bg-white"
                  }`}
              >
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${sel ? "bg-blue-800" : "bg-slate-100 border border-slate-300"
                  }`}>
                  <Text className={`text-xs font-extrabold ${sel ? "text-white" : "text-slate-500"}`}>
                    {opt.id}
                  </Text>
                </View>
                <Text className={`flex-1 text-sm leading-5 ${sel ? "text-blue-800 font-bold" : "text-slate-800"}`}>
                  {opt.text}
                </Text>
                {sel && <Text className="text-blue-600 text-base ml-2">✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom bar — bottom safe area + left/right insets */}
      <View
        className="flex-row items-center bg-white border-t border-blue-100"
        style={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
      >
        <TouchableOpacity
          onPress={() => setIdx((p) => Math.max(0, p - 1))}
          disabled={idx === 0}
          className={`rounded-lg px-4 py-2.5 border ${idx === 0 ? "border-blue-100" : "border-blue-300"}`}
        >
          <Text className={`text-sm font-bold ${idx === 0 ? "text-slate-400" : "text-blue-800"}`}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <View className="flex-1" />

        <TouchableOpacity
          onPress={() => setNavVisible(true)}
          className="flex-row items-center gap-1.5 bg-blue-800 rounded-lg px-5 py-2.5"
        >
          <Text className="text-sm">📋</Text>
          <Text className="text-white font-bold text-sm">
            Total ({answeredCount}/{qs.length})
          </Text>
        </TouchableOpacity>

        <View className="flex-1" />

        <TouchableOpacity
          onPress={() => setIdx((p) => Math.min(qs.length - 1, p + 1))}
          disabled={idx === qs.length - 1}
          className={`rounded-lg px-4 py-2.5 ${idx === qs.length - 1 ? "bg-slate-100" : "bg-blue-800"}`}
        >
          <Text className={`text-sm font-bold ${idx === qs.length - 1 ? "text-slate-400" : "text-white"}`}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      <NavModal
        visible={navVisible}
        questions={qs}
        answered={answered}
        currentIdx={idx}
        onJump={setIdx}
        onClose={() => setNavVisible(false)}
        onSubmit={() => setConfirmVisible(true)}
      />
      <ConfirmModal
        visible={confirmVisible}
        answered={answered}
        total={qs.length}
        onReview={() => setConfirmVisible(false)}
        onConfirm={doSubmit}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM LOADER
// ─────────────────────────────────────────────────────────────────────────────
function ExamLoader({ examId, onSubmit, onExit }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => fetchExam(examId),
    retry: 1,
  });

  if (isLoading) return <LoadingView text={`Loading Model Test ${examId}…`} dark />;
  if (isError || !data) {
    return (
      <NotFoundView
        message={`Model Test ${examId} could not be loaded.\nIt may not exist yet.`}
        onBack={onExit}
      />
    );
  }
  return <ExamScreen examData={data} onSubmit={onSubmit} onExit={onExit} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function ResultScreen({ examData, answered, onHome }) {
  const insets = useSafeAreaInsets();
  const qs = examData.questions;
  const correct = qs.filter((q) => answered[q.id] === q.correct).length;
  const rC = qs.slice(0, READING_COUNT).filter((q) => answered[q.id] === q.correct).length;
  const lC = qs.slice(READING_COUNT).filter((q) => answered[q.id] === q.correct).length;
  const pct = Math.round((correct / qs.length) * 100);
  const passed = pct >= 60;

  return (
    <View className="flex-1 bg-blue-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingLeft: insets.left + 20,
          paddingRight: insets.right + 20,
        }}
      >
        {/* Score card */}
        <View className={`rounded-2xl p-7 items-center mb-4 shadow-md ${passed ? "bg-blue-800" : "bg-red-700"}`}>
          <Text className="text-5xl">{passed ? "🎉" : "📚"}</Text>
          <Text className="text-white text-2xl font-black mt-2">
            {passed ? "PASSED!" : "Keep Studying"}
          </Text>
          <Text className="text-white/65 text-xs mt-0.5">Model Test {examData.id}</Text>
          <View className="bg-white/20 rounded-full px-8 py-3 mt-3.5">
            <Text className="text-white text-4xl font-black">{pct}%</Text>
          </View>
          <Text className="text-white/85 text-sm mt-2 font-semibold">
            {correct} / {qs.length} correct
          </Text>
        </View>

        {/* Section scores */}
        {[
          { label: "📖 Reading", got: rC, of: READING_COUNT },
          { label: "🎧 Listening", got: lC, of: LISTENING_COUNT },
        ].map((s) => (
          <View key={s.label} className="bg-white rounded-2xl p-4 mb-2.5 border border-blue-100">
            <View className="flex-row justify-between mb-2">
              <Text className="font-bold text-slate-800 text-sm">{s.label}</Text>
              <Text className="font-extrabold text-blue-800 text-sm">{s.got}/{s.of}</Text>
            </View>
            <View className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <View
                className="h-1.5 bg-blue-700 rounded-full"
                style={{ width: `${(s.got / s.of) * 100}%` }}
              />
            </View>
            <Text className="text-xs text-slate-500 mt-1.5">
              {Math.round((s.got / s.of) * 100)}% accuracy
            </Text>
          </View>
        ))}

        {/* Answer review grid */}
        <Text className="text-sm font-extrabold text-slate-800 mt-1.5 mb-2.5">Answer Review</Text>
        <View className="flex-row flex-wrap gap-1.5 mb-6">
          {qs.map((q, i) => {
            const ua = answered[q.id];
            const ok = ua === q.correct;
            const skip = ua === undefined;
            return (
              <View
                key={q.id}
                className={`w-9 h-9 rounded-lg items-center justify-center border ${skip
                    ? "bg-slate-100 border-slate-300"
                    : ok
                      ? "bg-green-50 border-green-600"
                      : "bg-red-50 border-red-600"
                  }`}
              >
                <Text className={`text-xs font-extrabold ${skip ? "text-slate-400" : ok ? "text-green-700" : "text-red-700"
                  }`}>
                  {i + 1}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity onPress={onHome} className="bg-blue-800 rounded-2xl p-4 items-center shadow-md">
          <Text className="text-white text-sm font-extrabold">← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState("home");
  const [examId, setExamId] = useState(null);
  const [examData, setExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);

  const startTest = (id) => {
    setExamId(id);
    setExamData(null);
    setExamResult(null);
    setScreen("exam");
  };

  const handleSubmit = (answered) => {
    const cached = queryClient.getQueryData(["exam", examId]);
    setExamData(cached);
    setExamResult(answered);
    setScreen("result");
  };

  const goHome = () => {
    setScreen("home");
    setExamId(null);
    setExamData(null);
    setExamResult(null);
  };

  if (screen === "home") return <HomeScreen onStart={startTest} />;
  if (screen === "exam") return <ExamLoader examId={examId} onSubmit={handleSubmit} onExit={goHome} />;
  if (screen === "result" && examData && examResult) {
    return <ResultScreen examData={examData} answered={examResult} onHome={goHome} />;
  }
  return <LoadingView dark />;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function UBTExam() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}