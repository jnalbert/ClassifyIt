import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import PictureScreen from '../screens/PictureScreen'
import HowItWorksScreen from '../screens/HowItWorksScreen';
import NotFoundScreen from '../screens/NotFoundScreen';

import GettingStartedScreen from '../screens/GettingStartedScreen';

const BottomTab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="TabOne"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint}} >
      <BottomTab.Screen
        name="Getting Started"
        component={GettingStartedNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-cube" color={color}/>,
        }}
      />
      <BottomTab.Screen
        name="Classification"
        component={PictureNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-camera" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="More Info"
        component={MoreInfoNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="md-information-circle-outline" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const TabOneStack = createStackNavigator();

function GettingStartedNavigator() {
  return (
    <TabOneStack.Navigator>
      <TabOneStack.Screen
        name="Getting Started"
        component={GettingStartedScreen}
        options={{ headerTitle: 'Getting Started ' }}
      />
    </TabOneStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator();

function PictureNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="Classification"
        component={PictureScreen}
        options={{ headerTitle: 'Classification' }}
      />
    </TabTwoStack.Navigator>
  );
}

const TabThreeStack = createStackNavigator();

function MoreInfoNavigator() {
  return (
    <TabThreeStack.Navigator>
      <TabThreeStack.Screen
        name="More Info"
        component={HowItWorksScreen}
        options={{ headerTitle: 'More Info' }}
      />
    </TabThreeStack.Navigator>
  );
}

export default BottomTabNavigator;