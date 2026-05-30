// app/LessonImages.jsx

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

import BottomNav from "../components/BottomNav";
import { booksData } from "./constants/data";

const { width, height } = Dimensions.get("window");

const MIN_SCALE = 1;
const MAX_SCALE = 5;

/* ───────────────────────── Zoomable Image ───────────────────────── */
const ZoomableImage = ({ uri }) => {
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
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Simultaneous(pinchGesture, panGesture),
    doubleTap
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.zoomContainer, animatedStyle]}>
        <Image source={{ uri }} style={styles.fullImage} resizeMode="contain" />
      </Animated.View>
    </GestureDetector>
  );
};

/* ───────────────────────── Modal ───────────────────────── */
const FullscreenModal = ({ visible, imageUri, onClose }) => {
  if (!imageUri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.modalBg}>
          <SafeAreaView style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.zoomHint}>
              Pinch / double tap to zoom
            </Text>
          </SafeAreaView>

          <View style={styles.imageWrapper}>
            <ZoomableImage uri={imageUri} />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

/* ───────────────────────── Main Screen ───────────────────────── */
const LessonImages = () => {
  const params = useLocalSearchParams();

  const countryId = String(params?.countryId || "");
  const lessonId = String(params?.lessonId || "");
  const lessonTitle = String(params?.lessonTitle || "Book View");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🔥 NEW NESTED LOGIC
  const country = booksData.find((c) => c.id === countryId);

  const lesson = country?.lessons?.find(
    (l) => l.lessonId === lessonId
  );

  const filteredBooks =
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openImage(item.image)}
      style={{ width }}
    >
      <View style={styles.cardContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <View style={styles.expandHint}>
          <Text style={styles.expandHintText}>⤢ Tap to expand</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.screen,
        {
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight : 0,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {lessonTitle}
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No images found
            </Text>
          </View>
        }
      />

      {/* MODAL */}
      <FullscreenModal
        visible={modalVisible}
        imageUri={selectedImage}
        onClose={closeModal}
      />

      <BottomNav />
    </SafeAreaView>
  );
};

export default LessonImages;

/* ───────────────────────── Styles ───────────────────────── */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  backBtn: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 8,
  },

  backBtnText: { fontWeight: "600" },

  headerTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
  },

  listContent: { paddingBottom: 120 },

  cardContainer: {
    alignItems: "center",
    padding: 10,
  },

  cardImage: {
    width: width * 0.95,
    height: height * 0.7,
    borderRadius: 12,
  },

  expandHint: { alignSelf: "flex-end", marginRight: 10 },

  expandHintText: { fontSize: 11, color: "#999" },

  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
  },

  emptyText: { color: "#999" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },

  closeBtn: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 20,
  },

  closeBtnText: { color: "#fff" },

  zoomHint: { color: "#aaa" },

  imageWrapper: { flex: 1 },

  zoomContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: width,
    height: height,
  },
});