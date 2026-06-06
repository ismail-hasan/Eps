import { useRoute } from '@react-navigation/native';
import { SafeAreaView, Text } from 'react-native';

const TestDetails = () => {
      const route = useRoute();
      // নেভিগেশন থেকে পাঠানো ডেটাটি রিসিভ করা হচ্ছে
      const { test } = route.params;

      return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                  <Text className="text-2xl font-bold text-blue-600">{test.name}</Text>
                  <Text className="text-slate-500 mt-2">ID: {test.id}</Text>
                  <Text className="mt-5 text-center px-5">এখানে আপনার এক্সাম পেপারের বিস্তারিত কন্টেন্ট থাকবে।</Text>
            </SafeAreaView>
      );
};

export default TestDetails;