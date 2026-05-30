import { Stack } from 'expo-router';
import { useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SW, height: SH } = Dimensions.get('window');
const IMG_HEIGHT = SW / 0.707;
const PAGE_HEIGHT = IMG_HEIGHT + 16;

const pages = [
  'https://i.ibb.co.com/KcJWFjXy/eps-topic-50-59-page-0001.webp',
  'https://i.ibb.co.com/KcJWFjXy/eps-topic-50-59-page-0001.webp',
  'https://i.ibb.co.com/KcJWFjXy/eps-topic-50-59-page-0001.webp',
  'https://i.ibb.co.com/KcJWFjXy/eps-topic-50-59-page-0001.webp',
];

const TRACK_H = SH - 120;
const TOTAL_H = PAGE_HEIGHT * pages.length + 20;
const THUMB_H = Math.max(40, (SH / TOTAL_H) * TRACK_H);
const MAX_THUMB_Y = TRACK_H - THUMB_H;
const MAX_SCROLL_Y = TOTAL_H - SH;

// ─── Zoomable Page ───────────────────────
function ZoomablePage({ uri, onZoomChange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const clampPan = (x, y, s) => {
    'worklet';
    const maxX = (SW * (s - 1)) / 2;
    const maxY = (IMG_HEIGHT * (s - 1)) / 2;
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  };

  const resetZoom = () => {
    'worklet';
    scale.value = withSpring(1);
    savedScale.value = 1;
    tx.value = withSpring(0);
    ty.value = withSpring(0);
    savedTx.value = 0;
    savedTy.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 1, 4);
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        resetZoom();
        runOnJS(onZoomChange)(false);
      } else {
        savedScale.value = scale.value;
        const c = clampPan(tx.value, ty.value, scale.value);
        tx.value = withSpring(c.x);
        ty.value = withSpring(c.y);
        runOnJS(onZoomChange)(true);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.value > 1) {
        resetZoom();
        runOnJS(onZoomChange)(false);
      } else {
        const s = 2.5;
        scale.value = withSpring(s);
        savedScale.value = s;
        const c = clampPan((SW / 2 - e.x) * (s - 1), (IMG_HEIGHT / 2 - e.y) * (s - 1), s);
        tx.value = withSpring(c.x);
        ty.value = withSpring(c.y);
        savedTx.value = c.x;
        savedTy.value = c.y;
        runOnJS(onZoomChange)(true);
      }
    });

  const pan = Gesture.Pan()
    .activeOffsetY([-5, 5])
    .activeOffsetX([-5, 5])
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      const c = clampPan(savedTx.value + e.translationX, savedTy.value + e.translationY, scale.value);
      tx.value = c.x;
      ty.value = c.y;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const composed = Gesture.Simultaneous(Gesture.Race(doubleTap, pan), pinch);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <View style={{ width: SW, height: IMG_HEIGHT, marginBottom: 16, overflow: 'hidden', backgroundColor: '#111' }}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[{ width: SW, height: IMG_HEIGHT }, animStyle]}>
          {loading && !error && (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{ position: 'absolute', alignSelf: 'center', top: IMG_HEIGHT / 2 - 16, zIndex: 1 }}
            />
          )}
          {error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#666' }}>❌ Page failed to load</Text>
            </View>
          ) : (
            <Animated.Image
              source={{ uri }}
              style={{ width: SW, height: IMG_HEIGHT }}
              resizeMode="contain"
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
            />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── Draggable Scrollbar ─────────────────
function CustomScrollbar({ scrollY, flatListRef }) {
  const thumbY = useSharedValue(0);
  const savedThumbY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const scrollList = useCallback((offset) => {
    flatListRef.current?.scrollToOffset({ offset, animated: false });
  }, [flatListRef]);

  const drag = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      savedThumbY.value = interpolate(scrollY.value, [0, MAX_SCROLL_Y], [0, MAX_THUMB_Y], 'clamp');
      thumbY.value = savedThumbY.value;
    })
    .onUpdate((e) => {
      thumbY.value = clamp(savedThumbY.value + e.translationY, 0, MAX_THUMB_Y);
      const newScroll = interpolate(thumbY.value, [0, MAX_THUMB_Y], [0, MAX_SCROLL_Y], 'clamp');
      runOnJS(scrollList)(newScroll);
    })
    .onEnd(() => {
      isDragging.value = false;
    });

  const thumbStyle = useAnimatedStyle(() => {
    const autoY = interpolate(scrollY.value, [0, MAX_SCROLL_Y], [0, MAX_THUMB_Y], 'clamp');
    return {
      transform: [{ translateY: isDragging.value ? thumbY.value : autoY }],
    };
  });

  return (
    <View
      style={{
        position: 'absolute',
        right: 0,
        top: 10,
        width: 28,           // wide hit area, invisible
        height: TRACK_H,
        zIndex: 100,
        alignItems: 'center',
      }}
    >
      {/* visible track — thin, centered */}
      <View
        style={{
          position: 'absolute',
          right: 6,
          width: 4,
          height: TRACK_H,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
      />

      {/* draggable thumb — fat + wide transparent hit area */}
      <GestureDetector gesture={drag}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 0,
              width: 28,         // full hit area width
              height: THUMB_H,
              alignItems: 'flex-end',
              paddingRight: 4,   // thumb sits near edge
            },
            thumbStyle,
          ]}
        >
          <View
            style={{
              width: 12,
              height: THUMB_H,
              borderRadius: 8,
              backgroundColor: '#F0FFFF',
            }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── Main Screen ─────────────────────────
export default function BookViewerScreen() {
  const flatListRef = useRef(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollY = useSharedValue(0);

  const handleScroll = useCallback((e) => {
    scrollY.value = e.nativeEvent.contentOffset.y;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <Stack.Screen
          options={{
            title: 'EPS Topic Book',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
          }}
        />
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={pages}
            keyExtractor={(_, i) => i.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            contentContainerStyle={{ paddingVertical: 10 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <ZoomablePage
                uri={item}
                onZoomChange={(zoomed) => setScrollEnabled(!zoomed)}
              />
            )}
          />
          <CustomScrollbar scrollY={scrollY} flatListRef={flatListRef} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}