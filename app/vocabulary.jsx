import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Clipboard,
  FlatList,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ১. Query Client তৈরি
const queryClient = new QueryClient();

// ২. API থেকে ডেটা আনা
const fetchVocabularyData = async () => {
  const response = await fetch("https://eps-backend.vercel.app/vocabulary");
  if (!response.ok) throw new Error("Network response error");
  const data = await response.json();
  return data || [];
};

// ─── Word Card Component ─────────────────────────────────────────
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

// ─── Vocabulary Screen Content ──────────────────────────────────────────
const VocabularyContent = () => {
  const navigation = useNavigation();

  // TanStack Query দিয়ে ডেটা ফেচিং
  const { data: words = [], isLoading: isApiLoading, error } = useQuery({
    queryKey: ["vocabularyData"],
    queryFn: fetchVocabularyData,
    staleTime: 1000 * 60 * 15,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const searchInputRef = useRef(null);
  const searchWidthAnim = useRef(new Animated.Value(0)).current;

  // ── অটোমেটিক ইউনিক ক্যাটাগরি লিস্ট তৈরি ──
  const categories = React.useMemo(() => {
    const list = new Set(words.map((w) => w.category).filter(Boolean));
    return ["All", ...Array.from(list)];
  }, [words]);

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

  // ── Filtered Data ──
  const displayData = useCallback(() => {
    let filteredList = words;

    if (selectedCategory !== "All") {
      filteredList = filteredList.filter((w) => w.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filteredList = filteredList.filter(
        (w) =>
          (w.korean && w.korean.includes(q)) ||
          (w.romanized && w.romanized.toLowerCase().includes(q)) ||
          (w.meaning_en && w.meaning_en.toLowerCase().includes(q)) ||
          (w.meaning_bn && w.meaning_bn.includes(q))
      );
    }

    return filteredList;
  }, [words, selectedCategory, searchQuery]);

  // ── Copy Function ──
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginRight: 8, padding: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>

        {!isSearchOpen && (
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A2E", flex: 1 }}>
            Vocabulary
          </Text>
        )}

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
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>
              Important Vocabulary
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 18 }}>
              Essential words and phrases you must know.
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 12, width: 48, height: 48,
              justifyContent: "center", alignItems: "center",
            }}
          >
            <Ionicons name="book" size={24} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* ── ক্যাটাগরি সেকশন (ব্যানারের সাথে ফিক্সড ও সুন্দরভাবে সাজানো) ── */}
      {!isApiLoading && !error && words.length > 0 && (
        <View style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 12,
                    backgroundColor: isActive ? "#1A1A2E" : "#F1F5F9", // অ্যাক্টিভ হলে ডার্ক ব্লু থিম যা দেখতে প্রিমিয়াম লাগে
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: isActive ? "#FFFFFF" : "#475569",
                      textTransform: "capitalize"
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Word List / Loading / Error Handling ── */}
      {isApiLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="cloud-offline-outline" size={40} color="#CBD5E1" />
          <Text style={{ color: "#94A3B8", marginTop: 8, fontWeight: "500" }}>
            Failed to load data from server
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id?.toString()}
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
};

// ৩. মূল এক্সপোর্ট
const Vocabulary = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <VocabularyContent />
    </QueryClientProvider>
  );
};

export default Vocabulary;