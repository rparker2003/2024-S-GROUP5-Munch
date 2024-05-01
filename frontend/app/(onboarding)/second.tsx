import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, Image } from 'tamagui';
import { Dimensions } from 'react-native';

const Second = () => {
  const router = useRouter();
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  return (
    <SafeAreaView>
      <Image
        width={'100%'}
        height={'90%'}
        source={{
          height: height,
          width: width,
          uri: 'https://i.ibb.co/HDXwNR3/Munch-Onboarding-02.png',
        }}
      />
      <Button
        onPress={() => {
          router.push('/third');
        }}
      >
        Continue
      </Button>
    </SafeAreaView>
  );
};

export default Second;
