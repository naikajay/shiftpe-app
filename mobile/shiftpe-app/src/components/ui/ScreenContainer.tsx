import { ReactNode } from "react";
import { ScrollView, ScrollViewProps, ViewStyle } from "react-native";

import { COLORS, SPACING } from "../../theme";

interface ScreenContainerProps extends ScrollViewProps {
  children: ReactNode;
  padded?: boolean;
  contentStyle?: ViewStyle;
}

export default function ScreenContainer({ children, padded = true, contentStyle, ...props }: ScreenContainerProps) {
  return (
    <ScrollView
      style={{ backgroundColor: COLORS.background, flex: 1 }}
      contentContainerStyle={[
        {
          gap: SPACING.lg,
          paddingBottom: 112,
          paddingTop: SPACING.xl,
          ...(padded ? { paddingHorizontal: SPACING.lg } : null),
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
