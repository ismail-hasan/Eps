import { useRouter } from 'expo-router'; // ১. রাউটার ইম্পোর্ট করলাম
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const EpsBook = () => {
      // const [countries, setCountries] = useState([]);
      const router = useRouter(); // ২. রাউটার হুক ইনিশিয়েট করলাম

      // // API থেকে data fetch
      // useEffect(() => {
      //       fetch('https://eps-backend.vercel.app/countries')
      //             .then(res => res.json())
      //             .then(data => setCountries(data))
      //             .catch(err => console.log(err));
      // }, []);

      const countries = [
            {
                  id: "6a240390d767eab1e6663f77",
                  name: "South Korea",
                  slug: "korea",
                  flag: "https://flagcdn.com/w320/kr.png",
            },
            {
                  id: "6a240390d767eab1e6663f76",
                  name: "Japan",
                  slug: "japan",
                  flag: "https://flagcdn.com/w320/jp.png",
            },
            {
                  id: 3,
                  name: "China",
                  slug: "china",
                  flag: "https://flagcdn.com/w320/cn.png",
            },
            {
                  id: 4,
                  name: "Bangladesh",
                  slug: "bangladesh",
                  flag: "https://flagcdn.com/w320/bd.png",
            },
            {
                  id: 5,
                  name: "India",
                  slug: "india",
                  flag: "https://flagcdn.com/w320/in.png",
            },
      ]




      return (
            <ScrollView className="flex-1 bg-gray-50 px-4 pt-12">

                  {/* Header */}
                  <Text className="text-2xl font-bold text-gray-900 mb-5">
                        Select a Country
                  </Text>

                  {/* Grid */}
                  <View className="flex-row flex-wrap justify-between pb-10">
                        {countries.map((country) => (
                              <TouchableOpacity
                                    key={country.id}
                                    activeOpacity={0.8}
                                    // ৩. এখানে ক্লিক করলে আইডি ইউআরএল-এ চলে যাবে এবং নতুন পেজ ওপেন হবে 👇
                                    onPress={() =>
                                          router.push({
                                                pathname: `/${country.id}`,


                                          })
                                    }
                                    className="w-[48%] bg-white border border-gray-200 rounded-2xl p-4 mb-4 items-center shadow-sm"
                              >
                                    {/* Flag */}
                                    <Image
                                          source={{ uri: country.flag }}
                                          className="w-14 h-10 rounded-md mb-3"
                                          resizeMode="cover"
                                    />

                                    {/* Country Name */}
                                    <Text className="text-sm font-semibold text-gray-700 text-center">
                                          {country.name}
                                    </Text>

                              </TouchableOpacity>
                        ))}
                  </View>
            </ScrollView>
      );
};

export default EpsBook;