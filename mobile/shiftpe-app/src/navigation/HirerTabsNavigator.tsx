import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HirerActivityScreen from "../screens/HirerActivityScreen";
import HirerDiscoverScreen from "../screens/HirerDiscoverScreen";
import HirerProfileScreen from "../screens/HirerProfileScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProviderDashboardScreen from "../screens/ProviderDashboardScreen";
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from "../theme";

export type HirerTabParamList = {
  Home: undefined;
  Discover: undefined;
  Messages: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<HirerTabParamList>();

const tabIcons: Record<keyof HirerTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Discover: "people",
  Messages: "chatbubble-ellipses",
  Activity: "albums",
  Profile: "business",
};

export default function HirerTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.94)",
          borderColor: COLORS.border,
          borderRadius: RADIUS.xl,
          borderTopWidth: 1,
          bottom: 18,
          height: 74,
          left: 16,
          paddingBottom: 10,
          paddingTop: 10,
          position: "absolute",
          right: 16,
          ...SHADOWS.floating,
        },
        tabBarIcon: ({ color, focused }) => (
          <View style={{ alignItems: "center", backgroundColor: focused ? COLORS.primarySoft : "transparent", borderRadius: RADIUS.pill, height: 32, justifyContent: "center", width: 42 }}>
            <Ionicons name={tabIcons[route.name]} color={color} size={focused ? 22 : 20} />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.micro,
          fontWeight: "900",
        },
      })}
    >
      <Tab.Screen name="Home" component={ProviderDashboardScreen} />
      <Tab.Screen name="Discover" component={HirerDiscoverScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Activity" component={HirerActivityScreen} />
      <Tab.Screen name="Profile" component={HirerProfileScreen} />
    </Tab.Navigator>
  );
}
