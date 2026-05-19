import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { colors, typography } from "../constants/theme";
import { TaskProvider } from "../context/TaskContext";
import ExploreTasksScreen from "../screens/ExploreTasksScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SwipeScreen from "../screens/SwipeScreen";
import WorkerHomeScreen from "../screens/WorkerHomeScreen";

export type WorkerTabParamList = {
  Home: undefined;
  Swipe: undefined;
  Explore: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<WorkerTabParamList>();

export default function WorkerTabsNavigator() {
  return (
    <TaskProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: {
            fontSize: typography.small,
            fontWeight: "800",
          },
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            height: 68,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={
                route.name === "Home"
                  ? "home"
                  : route.name === "Swipe"
                  ? "albums"
                  : route.name === "Explore"
                  ? "search"
                  : "person"
              }
              color={color}
              size={size}
            />
          ),
        })}
      >
        <Tab.Screen name="Home" component={WorkerHomeScreen} />
        <Tab.Screen name="Swipe" component={SwipeScreen} />
        <Tab.Screen name="Explore" component={ExploreTasksScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </TaskProvider>
  );
}
