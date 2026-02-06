import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { VoiceFirstIntroScreen } from '../screens/VoiceFirstIntroScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { ChoosePlanScreen } from '../screens/ChoosePlanScreen';
import { FamilySetupScreen } from '../screens/FamilySetupScreen';
import { OnboardingCompleteScreen } from '../screens/OnboardingCompleteScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  VoiceFirstIntro: undefined;
  Permissions: undefined;
  ChoosePlan: undefined;
  FamilySetup: undefined;
  OnboardingComplete: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="VoiceFirstIntro" component={VoiceFirstIntroScreen} />
    <Stack.Screen name="Permissions" component={PermissionsScreen} />
    <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
    <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
    <Stack.Screen
      name="OnboardingComplete"
      component={OnboardingCompleteScreen}
    />
  </Stack.Navigator>
);
