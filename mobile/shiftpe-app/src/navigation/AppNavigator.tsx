import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import ChatScreen from "../screens/ChatScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import OtpVerifyScreen from "../screens/OtpVerifyScreen";
import RoleSelectScreen from "../screens/RoleSelectScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SplashScreen from "../screens/SplashScreen";
import { Task } from "../types/task";
import HirerTabsNavigator from "./HirerTabsNavigator";
import WorkerTabsNavigator from "./WorkerTabsNavigator";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OtpVerify: undefined;
  RoleSelect: undefined;
  WorkerTabs: undefined;
  HirerTabs: undefined;
  AdminDashboard: undefined;
  Chat: { requestId: string };
  JobDetails: { task: Task };
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { step, user } = useAuth();

  const renderScreen = () => {
    if (step === "checking") {
      return <Stack.Screen name="Splash" component={SplashScreen} />;
    }

    if (step === "otpPending") {
      return <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />;
    }

    if (step === "rolePending") {
      return <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />;
    }

    if (step === "signedIn" && user?.role === "taskProvider") {
      return <Stack.Screen name="HirerTabs" component={HirerTabsNavigator} />;
    }

    if (step === "signedIn" && user?.role === "admin") {
      return <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />;
    }

    if (step === "signedIn") {
      return <Stack.Screen name="WorkerTabs" component={WorkerTabsNavigator} />;
    }

    return <Stack.Screen name="Login" component={LoginScreen} />;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        {renderScreen()}
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
