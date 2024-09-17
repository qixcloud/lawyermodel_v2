import React from "react";

import SplashScreen from "./src/content/SplashScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import AboutYourCase from "./src/content/screens/AboutYourCase";
import { TransitionPresets } from "@react-navigation/stack";

const App = () => {
  const Stack = createSharedElementStackNavigator();

  const MyStack = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardOverlayEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => {
            return {
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              overlayStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: "clamp",
                }),
              },
            };
          },
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      >
        <Stack.Screen name="Home" component={SplashScreen} />
        <Stack.Screen
          name="AboutYourCase"
          component={AboutYourCase}
          sharedElements={(route, otherRoute, showing) => {
            const { item } = route.params;
            return [`item.${item.title}.content`];
          }}
          options={() => ({})}
        />
      </Stack.Navigator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
