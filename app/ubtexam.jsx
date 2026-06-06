import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Audio } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── QueryClient ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = "https://eps-backend.vercel.app/epsexam";
const EXAM_DURATION = 50 * 60;
const READING_COUNT = 20;
const LISTENING_COUNT = 20;
const TOTAL = 40;

// ─── COLORS (blue-only palette) ───────────────────────────────────────────────
const B = {
  900: "#0D2B6B",
  800: "#1565C0",
  700: "#1976D2",
  600: "#1E88E5",
  500: "#2196F3",
  400: "#42A5F5",
  300: "#90CAF9",
  200: "#BBDEFB",
  100: "#E3F2FD",
  50: "#F0F7FF",
  white: "#FFFFFF",
  text: "#1A1A2E",
  textSec: "#546E7A",
  border: "#DDEEFF",
  red: "#D32F2F",
  green: "#2E7D32",
  greenLight: "#E8F5E9",
  redLight: "#FFEBEE",
  gray: "#90A4AE",
  grayLight: "#ECEFF1",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (s) => {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
};

// API response: { exam: [ { qNumber, instruction, question, options:string[], correctAnswer:number(0-based), audio?, image? } ] }
// Internal:     questions: [ { id, type, instruction, question, options:[{id,text}], correct(1-based), audio, image } ]
const normalise = (raw, id) => {
  const arr = raw?.exam ?? (Array.isArray(raw) ? raw : raw?.questions ?? raw?.data ?? null);
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
const fetchExam = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  const data = normalise(raw, id);
  if (!data) throw new Error("empty");
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function AudioBtn({ url }) {
  const [snd, setSnd] = useState(null);
  const [st, setSt] = useState("idle");
  useEffect(() => () => { snd?.unloadAsync(); }, [snd]);

  const press = async () => {
    if (st === "playing" && snd) {
      await snd.stopAsync(); await snd.unloadAsync();
      setSnd(null); setSt("idle"); return;
    }
    try {
      setSt("loading");
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync({ uri: url });
      setSnd(s); setSt("playing"); await s.playAsync();
      s.setOnPlaybackStatusUpdate((x) => {
        if (x.didJustFinish) { s.unloadAsync(); setSnd(null); setSt("idle"); }
      });
    } catch { setSt("idle"); Alert.alert("Audio Error", "Cannot play audio."); }
  };

  const playing = st === "playing";
  const loading = st === "loading";

  return (
    <TouchableOpacity
      onPress={press}
      disabled={loading}
      style={{
        flexDirection: "row", alignItems: "center", gap: 8,
        alignSelf: "flex-start",
        backgroundColor: playing ? B[800] : B[100],
        borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10,
        borderWidth: 1, borderColor: B[200],
        marginBottom: 14,
      }}
    >
      {loading
        ? <ActivityIndicator size="small" color={B[800]} />
        : <Text style={{ fontSize: 16 }}>{playing ? "⏹" : "▶"}</Text>
      }
      <Text style={{ fontSize: 13, fontWeight: "700", color: playing ? B.white : B[800] }}>
        {loading ? "Loading…" : playing ? "Stop" : "Play Audio"}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function HomeScreen({ onStart }) {
  const TESTS = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <View style={{ flex: 1, backgroundColor: B[50] }}>
      <StatusBar barStyle="light-content" backgroundColor={B[900]} />

      <View style={{
        backgroundColor: B[800], paddingTop: 54, paddingBottom: 20,
        paddingHorizontal: 20, elevation: 4,
      }}>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "700", letterSpacing: 2 }}>
          EPS-TOPIK
        </Text>
        <Text style={{ color: B.white, fontSize: 24, fontWeight: "900", marginTop: 2 }}>
          UBT Model Tests
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 3 }}>
          40 Questions · 50 Minutes · Reading & Listening
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: B.textSec, letterSpacing: 2, marginBottom: 12, marginTop: 4 }}>
          AVAILABLE TESTS
        </Text>
        {TESTS.map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => onStart(n)}
            activeOpacity={0.75}
            style={{
              backgroundColor: B.white, borderRadius: 12,
              marginBottom: 8, flexDirection: "row", alignItems: "center",
              paddingVertical: 14, paddingHorizontal: 16,
              borderWidth: 1, borderColor: B.border,
              elevation: 1,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: B[100], alignItems: "center",
              justifyContent: "center", marginRight: 14,
            }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: B[800] }}>{n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: B.text }}>Model Test {n}</Text>
              <Text style={{ fontSize: 11, color: B.textSec, marginTop: 2 }}>
                Reading (1–20) · Listening (21–40)
              </Text>
            </View>
            <View style={{
              backgroundColor: B[800], borderRadius: 8,
              paddingHorizontal: 16, paddingVertical: 8,
            }}>
              <Text style={{ color: B.white, fontWeight: "700", fontSize: 13 }}>Start →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATOR MODAL  — Total button খুললে দেখাবে + Submit button ও এখানে
// ─────────────────────────────────────────────────────────────────────────────
function NavModal({ visible, questions, answered, currentIdx, onJump, onClose, onSubmit }) {
  const answeredCount = Object.keys(answered).length;
  const unanswered = questions.length - answeredCount;

  const sections = [
    { label: "📖 Reading", start: 0, end: READING_COUNT - 1 },
    { label: "🎧 Listening", start: READING_COUNT, end: TOTAL - 1 },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: B.white,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: 20, maxHeight: "80%",
          }}
          onStartShouldSetResponder={() => true}
        >
          <View style={{ width: 36, height: 4, backgroundColor: B.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 }} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: B.text }}>Question Overview</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: B.textSec }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{
            flexDirection: "row", gap: 8,
            backgroundColor: B[100], borderRadius: 10,
            padding: 10, marginBottom: 16, alignItems: "center",
          }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: B[800] }}>
              {answeredCount} / {questions.length} answered
            </Text>
            {unanswered > 0 && (
              <Text style={{ fontSize: 12, color: B.textSec }}>
                · {unanswered} remaining
              </Text>
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 16, marginBottom: 14 }}>
            {[
              { color: B[800], label: "Current", border: false },
              { color: B.green, label: "Answered", border: false },
              { color: B.grayLight, label: "Unanswered", border: true },
            ].map((l) => (
              <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{
                  width: 12, height: 12, borderRadius: 3,
                  backgroundColor: l.color,
                  borderWidth: l.border ? 1 : 0, borderColor: B.gray,
                }} />
                <Text style={{ fontSize: 11, color: B.textSec }}>{l.label}</Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sections.map((sec) => (
              <View key={sec.label} style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: B.textSec, marginBottom: 8 }}>
                  {sec.label}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                  {questions.slice(sec.start, sec.end + 1).map((q, i) => {
                    const idx = sec.start + i;
                    const isAns = answered[q.id] !== undefined;
                    const isCur = idx === currentIdx;
                    return (
                      <TouchableOpacity
                        key={q.id}
                        onPress={() => { onJump(idx); onClose(); }}
                        style={{
                          width: 40, height: 40, borderRadius: 8,
                          alignItems: "center", justifyContent: "center",
                          backgroundColor: isCur ? B[800] : isAns ? B.green : B.grayLight,
                          borderWidth: 1,
                          borderColor: isCur ? B[800] : isAns ? B.green : B.gray,
                        }}
                      >
                        <Text style={{
                          fontSize: 12, fontWeight: "700",
                          color: isCur || isAns ? B.white : B.textSec,
                        }}>
                          {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Submit from navigator */}
          <TouchableOpacity
            onPress={() => { onClose(); onSubmit(); }}
            style={{
              backgroundColor: B[800], borderRadius: 10,
              padding: 14, alignItems: "center", marginTop: 12,
            }}
          >
            <Text style={{ color: B.white, fontWeight: "800", fontSize: 15 }}>
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
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
        <View style={{ backgroundColor: B.white, borderRadius: 20, padding: 26, alignItems: "center" }}>
          <Text style={{ fontSize: 36 }}>📝</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: B.text, marginTop: 10 }}>
            Submit Exam?
          </Text>
          <Text style={{ color: B.textSec, fontSize: 13, marginTop: 6, textAlign: "center" }}>
            {cnt} of {total} questions answered.
          </Text>
          {left > 0 && (
            <View style={{
              backgroundColor: "#FFF8E1", borderRadius: 8,
              padding: 10, marginTop: 12, width: "100%",
            }}>
              <Text style={{ color: "#E65100", fontWeight: "700", textAlign: "center", fontSize: 12 }}>
                ⚠️  {left} question{left > 1 ? "s" : ""} unanswered
              </Text>
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 18, width: "100%" }}>
            <TouchableOpacity
              onPress={onReview}
              style={{ flex: 1, backgroundColor: B.grayLight, borderRadius: 10, padding: 13, alignItems: "center" }}
            >
              <Text style={{ fontWeight: "700", color: B.textSec }}>Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{ flex: 1, backgroundColor: B[800], borderRadius: 10, padding: 13, alignItems: "center" }}
            >
              <Text style={{ fontWeight: "800", color: B.white }}>Submit ✓</Text>
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
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [navVisible, setNavVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const qs = examData.questions;
  const q = qs[idx];
  const answeredCount = Object.keys(answered).length;
  const isUrgent = timeLeft < 300;
  const isListening = q.type === "listening";

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    StatusBar.setHidden(true);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      StatusBar.setHidden(false);
    };
  }, []);

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
    <View style={{ flex: 1, backgroundColor: B.white }}>

      {/* ── Top bar ── */}
      <View style={{
        backgroundColor: B[800],
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 14, paddingVertical: 10,
        elevation: 4,
      }}>
        {/* Exit */}
        <TouchableOpacity
          onPress={() => Alert.alert("Exit Exam?", "Progress will be lost.", [
            { text: "Cancel" },
            { text: "Exit", style: "destructive", onPress: onExit },
          ])}
          style={{
            backgroundColor: B.red, borderRadius: 6,
            paddingHorizontal: 12, paddingVertical: 6,
          }}
        >
          <Text style={{ color: B.white, fontWeight: "700", fontSize: 12 }}>✕ Exit</Text>
        </TouchableOpacity>

        {/* Center */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: B.white, fontWeight: "800", fontSize: 15 }}>
            {"Model Test: "}
            <Text style={{ color: B.white }}>{examData.id}</Text>
            {"  "}
            <Text style={{ color: "rgba(255,255,255,0.65)", fontWeight: "400", fontSize: 13 }}>
              {"| Remaining: "}
            </Text>
            <Text style={{ color: isUrgent ? "#FF8A80" : "#FFEB3B", fontWeight: "900" }}>
              {fmt(timeLeft)}
            </Text>
          </Text>
        </View>

        {/* Right label */}
        <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "600" }}>
          Free UBT - {String(examData.id).padStart(2, "0")}
        </Text>
      </View>

      {/* ── 2-column body ── */}
      <View style={{ flex: 1, flexDirection: "row" }}>

        {/* LEFT — instruction + question + image/audio */}
        <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: B.border }}>

          {/* Instruction bar */}
          <View style={{
            backgroundColor: B[50],
            paddingHorizontal: 16, paddingVertical: 10,
            borderBottomWidth: 1, borderBottomColor: B.border,
            flexDirection: "row", alignItems: "flex-start", gap: 8,
          }}>
            <View style={{ width: 3, borderRadius: 2, backgroundColor: B[700], alignSelf: "stretch" }} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: B[800], flex: 1, lineHeight: 18 }}>
              {q.instruction}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            key={idx}
          >
            {/* Q number + text */}
            <Text style={{ fontSize: 14, color: B.text, marginBottom: 12, lineHeight: 22 }}>
              <Text style={{ fontWeight: "800", color: B.text }}>{idx + 1}. </Text>
              {q.question}
            </Text>

            {/* Image */}
            {q.image ? (
              <View style={{
                borderRadius: 10, overflow: "hidden",
                borderWidth: 1, borderColor: B.border,
                marginBottom: 10, alignSelf: "flex-start",
              }}>
                <Image source={{ uri: q.image }} style={{ width: 270, height: 170 }} resizeMode="cover" />
              </View>
            ) : null}

            {/* Audio */}
            {isListening && q.audio ? <AudioBtn url={q.audio} /> : null}
          </ScrollView>
        </View>

        {/* RIGHT — options */}
        <ScrollView
          style={{ flex: 1 }}
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
                style={{
                  flexDirection: "row", alignItems: "center",
                  borderRadius: 10,
                  borderWidth: sel ? 2 : 1,
                  borderColor: sel ? B[700] : B.border,
                  backgroundColor: sel ? B[100] : B.white,
                  paddingVertical: 13, paddingHorizontal: 14,
                }}
              >
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: sel ? B[800] : B.grayLight,
                  alignItems: "center", justifyContent: "center",
                  marginRight: 12,
                  borderWidth: sel ? 0 : 1, borderColor: B.gray,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: sel ? B.white : B.textSec }}>
                    {opt.id}
                  </Text>
                </View>
                <Text style={{
                  flex: 1, fontSize: 14, lineHeight: 20,
                  color: sel ? B[800] : B.text,
                  fontWeight: sel ? "700" : "400",
                }}>
                  {opt.text}
                </Text>
                {sel && <Text style={{ color: B[700], fontSize: 16, marginLeft: 8 }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Bottom bar ── */}
      <View style={{
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, paddingVertical: 10,
        backgroundColor: B.white,
        borderTopWidth: 1, borderTopColor: B.border,
      }}>
        <TouchableOpacity
          onPress={() => setIdx((p) => Math.max(0, p - 1))}
          disabled={idx === 0}
          style={{
            borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10,
            borderWidth: 1,
            borderColor: idx === 0 ? B.border : B[300],
            backgroundColor: B.white,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: idx === 0 ? B.gray : B[800] }}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* Total — click করলে overview + submit দেখাবে */}
        <TouchableOpacity
          onPress={() => setNavVisible(true)}
          style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: B[800], borderRadius: 8,
            paddingHorizontal: 20, paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 14 }}>📋</Text>
          <Text style={{ color: B.white, fontWeight: "700", fontSize: 13 }}>
            Total ({answeredCount}/{qs.length})
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={() => setIdx((p) => Math.min(qs.length - 1, p + 1))}
          disabled={idx === qs.length - 1}
          style={{
            borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10,
            backgroundColor: idx === qs.length - 1 ? B.grayLight : B[800],
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: idx === qs.length - 1 ? B.gray : B.white }}>
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
// RESULT SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function ResultScreen({ examData, answered, onHome }) {
  const qs = examData.questions;
  const correct = qs.filter((q) => answered[q.id] === q.correct).length;
  const rC = qs.slice(0, READING_COUNT).filter((q) => answered[q.id] === q.correct).length;
  const lC = qs.slice(READING_COUNT).filter((q) => answered[q.id] === q.correct).length;
  const pct = Math.round((correct / qs.length) * 100);
  const passed = pct >= 60;

  return (
    <View style={{ flex: 1, backgroundColor: B[50] }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

        <View style={{
          backgroundColor: passed ? B[800] : B.red,
          borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 18, elevation: 4,
        }}>
          <Text style={{ fontSize: 46 }}>{passed ? "🎉" : "📚"}</Text>
          <Text style={{ color: B.white, fontSize: 24, fontWeight: "900", marginTop: 8 }}>
            {passed ? "PASSED!" : "Keep Studying"}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 }}>
            Model Test {examData.id}
          </Text>
          <View style={{
            backgroundColor: "rgba(255,255,255,0.18)",
            borderRadius: 50, paddingHorizontal: 30, paddingVertical: 12, marginTop: 14,
          }}>
            <Text style={{ color: B.white, fontSize: 40, fontWeight: "900" }}>{pct}%</Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 8, fontWeight: "600" }}>
            {correct} / {qs.length} correct
          </Text>
        </View>

        {[
          { label: "📖 Reading", got: rC, of: READING_COUNT },
          { label: "🎧 Listening", got: lC, of: LISTENING_COUNT },
        ].map((s) => (
          <View key={s.label} style={{
            backgroundColor: B.white, borderRadius: 14, padding: 16,
            marginBottom: 10, borderWidth: 1, borderColor: B.border,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontWeight: "700", color: B.text, fontSize: 14 }}>{s.label}</Text>
              <Text style={{ fontWeight: "800", color: B[800], fontSize: 14 }}>{s.got}/{s.of}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: B[100], borderRadius: 3, overflow: "hidden" }}>
              <View style={{ height: 6, width: `${(s.got / s.of) * 100}%`, backgroundColor: B[700], borderRadius: 3 }} />
            </View>
            <Text style={{ fontSize: 11, color: B.textSec, marginTop: 5 }}>
              {Math.round((s.got / s.of) * 100)}% accuracy
            </Text>
          </View>
        ))}

        <Text style={{ fontSize: 14, fontWeight: "800", color: B.text, marginTop: 6, marginBottom: 10 }}>
          Answer Review
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
          {qs.map((q, i) => {
            const ua = answered[q.id];
            const ok = ua === q.correct;
            const skip = ua === undefined;
            return (
              <View key={q.id} style={{
                width: 36, height: 36, borderRadius: 8,
                alignItems: "center", justifyContent: "center",
                backgroundColor: skip ? B.grayLight : ok ? B.greenLight : B.redLight,
                borderWidth: 1, borderColor: skip ? B.gray : ok ? B.green : B.red,
              }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: skip ? B.gray : ok ? B.green : B.red }}>
                  {i + 1}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={onHome}
          style={{
            backgroundColor: B[800], borderRadius: 14,
            padding: 16, alignItems: "center", elevation: 3,
          }}
        >
          <Text style={{ color: B.white, fontSize: 15, fontWeight: "800" }}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM LOADER — TanStack Query দিয়ে data fetch
// ─────────────────────────────────────────────────────────────────────────────
function ExamLoader({ examId, onSubmit, onExit }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => fetchExam(examId),
    retry: 1,
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: B[800], alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={B.white} />
        <Text style={{ color: B.white, fontSize: 15, fontWeight: "700", marginTop: 16 }}>
          Loading exam…
        </Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: B[50], alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Text style={{ fontSize: 56 }}>😕</Text>
        <Text style={{ fontSize: 20, fontWeight: "900", color: B.text, marginTop: 14, textAlign: "center" }}>
          Not Found
        </Text>
        <Text style={{ fontSize: 13, color: B.textSec, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
          This exam could not be loaded.{"\n"}It may not exist yet.
        </Text>
        <TouchableOpacity
          onPress={onExit}
          style={{
            marginTop: 24, backgroundColor: B[800], borderRadius: 12,
            paddingHorizontal: 28, paddingVertical: 13,
          }}
        >
          <Text style={{ color: B.white, fontWeight: "800", fontSize: 14 }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <ExamScreen examData={data} onSubmit={onSubmit} onExit={onExit} />;
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
  return (
    <View style={{ flex: 1, backgroundColor: B[800], alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={B.white} />
    </View>
  );
}

export default function UBTExam() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}