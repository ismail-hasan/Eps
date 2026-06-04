import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Clipboard,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Word Card ─────────────────────────────────────────────────────────────
const WordCard = React.memo(({ item, onCopy, copiedId }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A2E", letterSpacing: 0.3 }}>
        {item.korean}
      </Text>
      <Text style={{ fontSize: 13, color: "#64748B", marginTop: 1 }}>{item.romanized}</Text>
      <Text style={{ fontSize: 13, color: "#475569", marginTop: 3, fontWeight: "500" }}>
        Meaning: {item.meaning_en}
      </Text>
      {item.meaning_bn ? (
        <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
          অর্থ: {item.meaning_bn}
        </Text>
      ) : null}
    </View>

    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Copy Icon - Only copies the Korean word */}
      <TouchableOpacity
        onPress={() => onCopy(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ padding: 8, borderRadius: 20, backgroundColor: "#F8FAFC" }}
      >
        <Ionicons
          name={copiedId === item.id ? "checkmark-done" : "copy-outline"}
          size={18}
          color={copiedId === item.id ? "#22C55E" : "#94A3B8"}
        />
      </TouchableOpacity>
    </View>
  </View>
));

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function Vocabulary() {
  const navigation = useNavigation();

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const searchInputRef = useRef(null);
  const searchWidthAnim = useRef(new Animated.Value(0)).current;

  // ── API থেকে ডাটা ফেচ করা ──
  useEffect(() => {
    fetch("https://eps-backend.vercel.app/vocabulary")
      .then((res) => res.json())
      .then((data) => {
        setWords(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching vocabulary:", err);
        setLoading(false);
      });
  }, []);

  // ── Open / Close Search ──
  const openSearch = () => {
    setIsSearchOpen(true);
    Animated.timing(searchWidthAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start(() => searchInputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setSearchQuery("");
    setIsSearchOpen(false);
    Animated.timing(searchWidthAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  // ── Filtered Data (সার্চ ফিল্টারিং) ──
  const displayData = useCallback(() => {
    let list = words;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (w) =>
          (w.korean && w.korean.includes(q)) ||
          (w.romanized && w.romanized.toLowerCase().includes(q)) ||
          (w.meaning_en && w.meaning_en.toLowerCase().includes(q)) ||
          (w.meaning_bn && w.meaning_bn.includes(q))
      );
    }

    return list;
  }, [words, searchQuery]);

  // ── Copy Function (শুধুমাত্র কোরিয়ান শব্দ কপি হবে) ──
  const handleCopy = useCallback((item) => {
    Clipboard.setString(item.korean);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const data = displayData();

  const animatedSearchWidth = searchWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "75%"],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          minHeight: 56,
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginRight: 8, padding: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>

        {/* Title — hide when search is open */}
        {!isSearchOpen && (
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A2E", flex: 1 }}>
            Vocabulary
          </Text>
        )}

        {/* Animated Search Input */}
        {isSearchOpen && (
          <Animated.View style={{ width: animatedSearchWidth, overflow: "hidden" }}>
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search words..."
              placeholderTextColor="#94A3B8"
              style={{
                flex: 1,
                fontSize: 15,
                color: "#1A1A2E",
                borderBottomWidth: 2,
                borderBottomColor: "#FF8C00",
                paddingBottom: 4,
                paddingHorizontal: 4,
              }}
              returnKeyType="search"
              autoCorrect={false}
            />
          </Animated.View>
        )}

        <View style={{ flex: isSearchOpen ? 1 : 0 }} />

        {/* Search / Close Icon */}
        <TouchableOpacity
          onPress={isSearchOpen ? closeSearch : openSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: 4 }}
        >
          <Ionicons
            name={isSearchOpen ? "close" : "search-outline"}
            size={22}
            color="#475569"
          />
        </TouchableOpacity>
      </View>

      {/* ── Banner Card ── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <View
          style={{
            backgroundColor: "#FF8C00",
            borderRadius: 16,
            padding: 18,
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute", right: -20, top: -20,
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />
          <View
            style={{
              position: "absolute", right: 30, bottom: -30,
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>
              Important Vocabulary
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 18 }}>
              Essential words and phrases{"\n"}you must know.
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 12, width: 56, height: 56,
              justifyContent: "center", alignItems: "center",
            }}
          >
            <Ionicons name="book" size={28} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* ── Word List / Loading Handling ── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WordCard
              item={item}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
              <Ionicons name="search-outline" size={48} color="#E2E8F0" />
              <Text style={{ fontSize: 15, color: "#CBD5E1", marginTop: 12, fontWeight: "600" }}>
                কোনো শব্দ পাওয়া যায়নি
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}