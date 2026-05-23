import { ReactNode } from "react";
import { ScrollView, ScrollViewProps, ViewStyle } from "react-native";

import { colors, spacing } from "../../constants/theme";

interface AppScreenProps extends ScrollViewProps {
  children: ReactNode;
  padded?: boolean;
  contentStyle?: ViewStyle;
}

export default function AppScreen({ children, padded = true, contentStyle, ...props }: AppScreenProps) {
  return (
    <ScrollView
      style={{ backgroundColor: colors.surface, flex: 1 }}
      contentContainerStyle={[
        {
          gap: spacing.lg,
          paddingBottom: 112,
          paddingTop: spacing.xl,
          ...(padded ? { paddingHorizontal: spacing.lg } : null),
        },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
