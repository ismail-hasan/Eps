import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Clipboard,
  Platform,
  TextInput,
  Animated,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ─── Demo Data (Backend থেকে আসবে পরে) ───────────────────────────────────
const DEMO_WORDS = [
  { id: "1",  korean: "안전",   romanized: "An-jeon",      meaning_en: "Safety",             meaning_bn: "নিরাপত্তা",            category: "Safety"    },
  { id: "2",  korean: "사고",   romanized: "Sa-go",        meaning_en: "Accident",            meaning_bn: "দুর্ঘটনা",             category: "Safety"    },
  { id: "3",  korean: "작업",   romanized: "Jak-eop",      meaning_en: "Work / Task",         meaning_bn: "কাজ",                  category: "Work"      },
  { id: "4",  korean: "주의",   romanized: "Ju-i",         meaning_en: "Caution / Attention", meaning_bn: "সতর্কতা",             category: "Safety"    },
  { id: "5",  korean: "보호구", romanized: "Bo-ho-gu",     meaning_en: "Protective Gear",     meaning_bn: "সুরক্ষামূলক সরঞ্জাম", category: "Safety"    },
  { id: "6",  korean: "월급",   romanized: "Wol-geup",     meaning_en: "Monthly Salary",      meaning_bn: "মাসিক বেতন",           category: "HR"        },
  { id: "7",  korean: "근무",   romanized: "Geun-mu",      meaning_en: "Work / Duty",         meaning_bn: "দায়িত্ব পালন",        category: "Work"      },
  { id: "8",  korean: "휴가",   romanized: "Hyu-ga",       meaning_en: "Vacation / Leave",    meaning_bn: "ছুটি",                 category: "HR"        },
  { id: "9",  korean: "화재",   romanized: "Hwa-jae",      meaning_en: "Fire",                meaning_bn: "আগুন",                 category: "Emergency" },
  { id: "10", korean: "대피",   romanized: "Dae-pi",       meaning_en: "Evacuation",          meaning_bn: "নিরাপদ স্থানে যাওয়া", category: "Emergency" },
  { id: "11", korean: "계약",   romanized: "Gye-yak",      meaning_en: "Contract",            meaning_bn: "চুক্তি",               category: "HR"        },
  { id: "12", korean: "작업장", romanized: "Jak-eop-jang", meaning_en: "Workplace",           meaning_bn: "কর্মক্ষেত্র",         category: "Work"      },
];

const TABS = ["All", "Bookmarked", "Recent"];

// ─── Word Card ─────────────────────────────────────────────────────────────
const WordCard = React.memo(({ item, isFavorite, onToggleFavorite, onCopy, copiedId }) => (
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

    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {/* Copy Icon */}
      <TouchableOpacity
        onPress={() => onCopy(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
        style={{ padding: 8, borderRadius: 20, backgroundColor: "#F8FAFC" }}
      >
        <Ionicons
          name={copiedId === item.id ? "checkmark-done" : "copy-outline"}
          size={18}
          color={copiedId === item.id ? "#22C55E" : "#94A3B8"}
        />
      </TouchableOpacity>

      {/* Star / Favorite */}
      <TouchableOpacity
        onPress={() => onToggleFavorite(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
        style={{ padding: 8 }}
      >
        <Ionicons
          name={isFavorite ? "star" : "star-outline"}
          size={22}
          color={isFavorite ? "#FBBF24" : "#CBD5E1"}
        />
      </TouchableOpacity>
    </View>
  </View>
));

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function Vocabulary() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("All");
  const [favorites, setFavorites] = useState(new Set(["1", "4", "5"]));
  const [recentIds] = useState(["1", "3", "6", "9"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const searchInputRef = useRef(null);
  const searchWidthAnim = useRef(new Animated.Value(0)).current;

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
    let list = DEMO_WORDS;

    if (activeTab === "Bookmarked") list = list.filter((w) => favorites.has(w.id));
    else if (activeTab === "Recent") list = list.filter((w) => recentIds.includes(w.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.korean.includes(q) ||
          w.romanized.toLowerCase().includes(q) ||
          w.meaning_en.toLowerCase().includes(q) ||
          w.meaning_bn.includes(q)
      );
    }

    return list;
  }, [activeTab, favorites, recentIds, searchQuery]);

  // ── Toggle Favorite ──
  const handleToggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Copy ──
  const handleCopy = useCallback((item) => {
    const text = `${item.korean} (${item.romanized})\nMeaning: ${item.meaning_en}\nঅর্থ: ${item.meaning_bn}`;
    Clipboard.setString(text);
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
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
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

      {/* ── Tab Bar ── */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          marginTop: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                marginRight: 24,
                paddingBottom: 10,
                borderBottomWidth: isActive ? 2.5 : 0,
                borderBottomColor: "#FF8C00",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#FF8C00" : "#94A3B8",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Word List ── */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WordCard
            item={item}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={handleToggleFavorite}
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
              {searchQuery ? "কোনো শব্দ পাওয়া যায়নি" : activeTab === "Bookmarked" ? "কোনো Bookmark নেই" : "কোনো শব্দ নেই"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/*
 * ─── Backend Integration ────────────────────────────────────────────────────
 *
 *   const [words, setWords] = useState([]);
 *
 *   useEffect(() => {
 *     fetch('https://your-api.com/api/vocabulary')
 *       .then(res => res.json())
 *       .then(data => setWords(data));
 *   }, []);
 *
 * DEMO_WORDS replace করে words state use করো।
 * ─────────────────────────────────────────────────────────────────────────
 */