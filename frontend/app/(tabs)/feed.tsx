import { useAuth } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native';
import { Text, View } from 'tamagui';

export default function TabTwoScreen() {
  return (
    <SafeAreaView>
      <View>
        <Text>Feed view</Text>
      </View>
    </SafeAreaView>
  );
}
