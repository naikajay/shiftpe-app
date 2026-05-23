import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { colors, typography } from "../constants/theme";
import { TaskProvider } from "../context/TaskContext";
import AppliedScreen from "../screens/AppliedScreen";
import ExploreTasksScreen from "../screens/ExploreTasksScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import WorkerHomeScreen from "../screens/WorkerHomeScreen";

export type WorkerTabParamList = {
  Home: undefined;
  Discover: undefined;
  Messages: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<WorkerTabParamList>();

const tabIcons: Record<keyof WorkerTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Discover: "search",
  Messages: "chatbubble-ellipses",
  Activity: "albums",
  Profile: "person",
};

export default function WorkerTabsNavigator() {
  return (
    <TaskProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: "rgba(255,255,255,0.92)",
            borderColor: colors.border,
            borderRadius: 28,
            borderTopWidth: 1,
            bottom: 18,
            height: 74,
            left: 16,
            paddingBottom: 10,
            paddingTop: 10,
            position: "absolute",
            right: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 8,
          },
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                backgroundColor: focused ? colors.accentSoft : "transparent",
                borderRadius: 999,
                height: 32,
                justifyContent: "center",
                width: 42,
              }}
            >
              <Ionicons name={tabIcons[route.name]} color={color} size={focused ? 22 : 20} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: typography.small - 2,
            fontWeight: "900",
          },
        })}
      >
        <Tab.Screen name="Home" component={WorkerHomeScreen} />
        <Tab.Screen name="Discover" component={ExploreTasksScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Activity" component={AppliedScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </TaskProvider>
  );
}
