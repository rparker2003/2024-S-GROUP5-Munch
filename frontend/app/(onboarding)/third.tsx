import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, Image } from 'tamagui';
import { Dimensions } from 'react-native';

const Third = () => {
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
          uri: 'https://i.ibb.co/B4mbqSp/Munch-Onboarding-03.png',
        }}
      />
      <Button
        onPress={() => {
          router.push('/login');
        }}
      >
        Continue
      </Button>
    </SafeAreaView>
  );
};

export default Third;
