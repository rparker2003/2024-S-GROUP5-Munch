import { Subtitle } from '@/tamagui.config';
import { Byte, Recipe } from '@/types/post';
import { getDateDifference } from '@/utils/getCurrentDateTime';
import { isByte, isRecipe } from '@/utils/typeGuard';
import { useRouter } from 'expo-router';
import React, { FC, useContext, useState } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Button, Image, Text, View, XStack, YStack } from 'tamagui';
import ButtonIcon from './ButtonIcon';
import DeletePostDialog from './DeletePostDialog';
import { EditPostDialog } from './EditPostDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/contexts/UserContext';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface PostProps {
  post: Byte | Recipe;
}

const Post: FC<PostProps> = ({ post }) => {
  const {
    author,
    comments,
    creation_date,
    description,
    likes,
    pictures,
    username,
    key,
  } = post;

  const byte = isByte(post) ? post : null;
  const recipe = isRecipe(post) ? post : null;
  const router = useRouter();
  const { height, width } = Dimensions.get('screen');
  const theme = useColorScheme();

  const openMaps = async () => {
    const iosLink = `maps://0,0?q=${byte?.location}`;
    const androidLink = `geo:0,0?q=${byte?.location}`;
    Linking.openURL(Platform.OS === 'ios' ? iosLink : androidLink);
  };

  // Used to query and mutate
  const queryClient = useQueryClient();
  const { user_data, user } = useContext(UserContext);

  const progressValue = useSharedValue(0);
  const { getToken, userId } = useAuth();
  const postId = key.split('/')[1];
  // Like button state
  const [liked, setLiked] = useState(
    user_data.likes.includes(`posts/${postId}`),
  );

  // Data that will be passed in order to change the post's likes
  const likeData = {
    user_id: userId,
    post_id: postId,
  };

  // Like/Unlike a post
  const { mutateAsync: changeLikes, error } = useMutation({
    mutationKey: [postId, user_data],
    mutationFn: async () => {
      // Determine whether to like or unlike the post
      const likeAction = liked ? 'like' : 'unlike';

      // Do the API call
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/users/${userId}/${likeAction}/${postId}`,
        likeData,
        {
          headers: { Authorization: `Bearer: ${await getToken()}` },
        },
      );
      return response.data;
    },
    // Update the like count
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [user, postId, user_data, 'key'],
      });
    },
    // Show error message in console
    onError: () => {
      console.log('error:', error.message);
    },
  });

  // Handle user liking the post
  const handleLike = async () => {
    // Invert the like state
    setLiked(!liked);
    // Like or unlike the post based on liked state
    await changeLikes();
  };
  const handleBookmark = async () => {};
  const carouselConfig = {
    width: width,
    height: height / 1.5,
    vertical: false,
    mode: 'parallax',
    snapEnabled: true,
    modeConfig: {
      parallaxScrollingScale: 1,
      parallaxScrollingOffset: 50,
    },
  } as const;

  return (
    <SafeAreaView>
      <Carousel
        {...carouselConfig}
        loop
        pagingEnabled={true}
        onProgressChange={(_, absoluteProgress) => {
          progressValue.value = absoluteProgress;
        }}
        data={pictures}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item, cache: 'force-cache' }}
            height={height / 1.5}
            borderRadius={'$2'}
          />
        )}
      />
      {pictures.map((_, index) => {
        return (
          <PaginationItem
            backgroundColor='#26292E'
            animValue={progressValue}
            index={index}
            key={index}
            length={pictures.length}
          />
        );
      })}
      <YStack display='flex' rowGap={'$1'} marginBottom={'$10'}>
        {userId === author.split('/')[1] && (
          <XStack display='flex' justifyContent='space-around'>
            <EditPostDialog post={post} />
            <DeletePostDialog postId={postId} />
          </XStack>
        )}
        <XStack display='flex' justifyContent='center'>
          <XStack alignItems='center' justifyContent='space-evenly'>
            {/*Like*/}
            <Button
              size={'$4'}
              circular
              animation={'bouncy'}
              animateOnly={['transform']}
              icon={
                <AntDesign
                  size={22}
                  name={liked ? 'heart' : 'hearto'}
                  color={liked ? 'red' : theme === 'dark' ? 'white' : 'black'}
                />
              }
              justifyContent='center'
              alignItems='center'
              onPress={handleLike}
              pressStyle={{ scale: 0.4 }}
              padding={10}
              unstyled
            />
            {/*Display number of likes*/}
            <Text>{likes.length}</Text>
          </XStack>
          {/*Comment*/}
          <ButtonIcon
            iconName='comment-o'
            onPress={() => {
              router.push({
                pathname: '/(modals)/comments',
                params: {
                  comments: JSON.stringify(comments),
                  post_id: key.split('/')[1],
                },
              });
            }}
          />
          {/*Bookmark*/}
          <ButtonIcon iconName='bookmark-o' onPress={handleBookmark} />
          {/*Location*/}
          {byte?.location && <ButtonIcon iconName='map-o' onPress={openMaps} />}
        </XStack>
        {/*USER INFO*/}
        <YStack px={'$2.5'} gap={'$1'}>
          <XStack gap={'$2'} rowGap={'$5'}>
            {/* <Link href={`/user/${author.split('/')[1]}`} asChild> */}
            <Text
              fontWeight={'800'}
              onPress={() =>
                router.navigate({
                  pathname: `/user/${author.split('/')[1]}`,
                  params: { prev: 'Friends' },
                })
              }
            >
              {username}
            </Text>
            {/* </Link> */}
            <Text>{description}</Text>
          </XStack>
          <Subtitle unstyled size={'$1'}>
            {getDateDifference(creation_date)}
          </Subtitle>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
};

const PaginationItem: React.FC<{
  index: number;
  backgroundColor: string;
  length: number;
  animValue: SharedValue<number>;
  isRotate?: boolean;
}> = (props) => {
  const { animValue, index, length, backgroundColor, isRotate } = props;
  const width = 10;

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-width, 0, width];

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-width, 0, width];
    }

    return {
      transform: [
        {
          translateX: interpolate(
            animValue?.value,
            inputRange,
            outputRange,
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  }, [animValue, index, length]);
  return (
    <View
      style={{
        backgroundColor: 'white',
        width,
        height: width,
        borderRadius: 50,
        overflow: 'hidden',
        transform: [
          {
            rotateZ: isRotate ? '90deg' : '0deg',
          },
        ],
      }}
    >
      <Animated.View
        style={[
          {
            borderRadius: 50,
            backgroundColor,
            flex: 1,
          },
          animStyle,
        ]}
      />
    </View>
  );
};
export default Post;
