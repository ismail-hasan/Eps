import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";

const BASE_URL = "https://eps-backend.vercel.app";
const { width, height } = Dimensions.get("window");

const MIN_SCALE = 1;
const MAX_SCALE = 5;

/* ───────────────── Zoom Image Component ───────────────── */
const ZoomableImage = ({ uri }) => {
  const [imgLoading, setImgLoading] = useState(true); // মোডাল ইমেজের জন্য লোডিং স্টেট

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch().onUpdate((e) => {
    const next = savedScale.value * e.scale;
    scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
  });

  const panGesture = Gesture.Pan().onUpdate((e) => {
    if (savedScale.value > 1) {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    }
  });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const gesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* মোডাল ইমেজ লোডিং স্পিনার */}
      {imgLoading && (
        <View style={StyleSheet.absoluteFillObject} className="justify-center items-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.zoomContainer, animatedStyle]}>
          <Image
            source={{ uri }}
            style={styles.fullImage}
            resizeMode="contain"
            onLoadStart={() => setImgLoading(true)}
            onLoadEnd={() => setImgLoading(false)}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

/* ───────────────── List Image Item Component ───────────────── */
// মেইন লিস্টের প্রতিটি ইমেজের লোডিং আলাদাভাবে ট্র্যাক করার জন্য সাব-কম্পোনেন্ট
const ListImageItem = ({ uri, onPress }) => {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
      {loading && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      )}
      <Image
        source={{ uri }}
        style={styles.image}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </TouchableOpacity>
  );
};

/* ───────────────── MAIN COMPONENT ───────────────── */
export default function LessonImages() {
  const { countryId, lessonId, lessonTitle } = useLocalSearchParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`${BASE_URL}/book`);
      const data = await res.json();

      const country = data.find((c) => c.id == countryId);
      const foundLesson = country?.lessons?.find(
        (l) => l.lessonId == lessonId
      );

      setLesson(foundLesson);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const images =
    lesson?.images?.map((img, index) => ({
      id: `${lessonId}-${index}`,
      image: img,
    })) || [];

  const openImage = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 8, color: "#64748b" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {lessonTitle}
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListImageItem uri={item.image} onPress={() => openImage(item.image)} />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalBg}>
            {/* Close Button Header inside Modal */}
            <SafeAreaView style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={26} color="#ffffff" />
                <Text style={{ color: "#fff", marginLeft: 4, fontWeight: "600" }}>Close</Text>
              </TouchableOpacity>
            </SafeAreaView>

            <ZoomableImage uri={selectedImage} />
          </View>
        </GestureHandlerRootView>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

/* ───────────────── STYLES ───────────────── */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },

  headerTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },

  imageContainer: {
    width: width,
    height: height * 0.7,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc", // ইমেজ লোড হওয়ার সময় ব্যাকগ্রাউন্ড কালার
  },

  image: {
    width: "100%",
    height: "100%",
  },

  spinnerOverlay: {
    position: "absolute",
    zIndex: 1,
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },

  modalHeader: {
    position: "absolute",
    top: 10,
    left: 16,
    zIndex: 10,
  },

  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  zoomContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width,
    height,
  },
});