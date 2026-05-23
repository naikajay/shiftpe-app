import { useMemo, useState } from "react";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import ErrorMessage from "../components/ErrorMessage";
import InputField from "../components/inputs/InputField";
import PrimaryButton from "../components/buttons/PrimaryButton";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenIntro from "../components/design/ScreenIntro";
import SecondaryButton from "../components/buttons/SecondaryButton";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { RootStackParamList } from "../navigation/AppNavigator";
import { tasks } from "../services/tasks";
import { useAuthStore } from "../store/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");
  const [skillDraft, setSkillDraft] = useState("");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate ? String(user.hourlyRate) : "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [longitude, setLongitude] = useState(user?.location?.coordinates?.[0] !== undefined ? String(user.location.coordinates[0]) : "");
  const [latitude, setLatitude] = useState(user?.location?.coordinates?.[1] !== undefined ? String(user.location.coordinates[1]) : "");
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validationError = useMemo(
    () => validateProfile({
      fullName,
      hourlyRate,
      bio,
      longitude,
      latitude,
      skills,
    }),
    [bio, fullName, hourlyRate, latitude, longitude, skills]
  );

  const pickImage = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Photo library permission is required to update your profile image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const addSkill = () => {
    const skill = skillDraft.trim().toLowerCase();
    if (!skill) return;
    if (skills.includes(skill)) {
      setSkillDraft("");
      return;
    }
    if (skills.length >= 30) {
      setError("You can add up to 30 skills.");
      return;
    }
    setSkills((current) => [...current, skill]);
    setSkillDraft("");
    setError(null);
  };

  const removeSkill = (skill: string) => {
    setSkills((current) => current.filter((item) => item !== skill));
  };

  const save = async () => {
    const nextError = validationError;
    if (nextError) {
      setError(nextError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const hasLocation = longitude.trim() && latitude.trim();
      const nextUser = await tasks.updateProfile({
        fullName: fullName.trim(),
        profileImage: profileImage.trim() || undefined,
        skills,
        hourlyRate: hourlyRate.trim() ? Number(hourlyRate) : 0,
        bio: bio.trim(),
        isAvailable,
        location: hasLocation
          ? {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            }
          : undefined,
      });

      await updateUser(nextUser);
      Alert.alert("Profile", "Profile updated.");
      navigation.goBack();
    } catch (caught: any) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenIntro eyebrow="Edit Profile" title="Update your live profile" subtitle="These details power matching, trust, and realtime hiring." />

      <View style={cardStyle}>
        <View style={{ alignItems: "center", gap: SPACING.md }}>
          <Avatar name={fullName || user?.fullName} uri={profileImage} size={104} />
          <View style={{ flexDirection: "row", gap: SPACING.sm }}>
            <SecondaryButton label="Choose image" onPress={pickImage} disabled={loading} style={{ minHeight: 44 }} />
            {profileImage ? (
              <SecondaryButton label="Remove" onPress={() => setProfileImage("")} disabled={loading} style={{ minHeight: 44 }} />
            ) : null}
          </View>
        </View>

        <InputField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your full name" editable={!loading} />
        <InputField label="Hourly rate" value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder="Set your rate" editable={!loading} />
        <InputField label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Short bio for hirers and workers" editable={!loading} />

        <View style={{ gap: SPACING.sm }}>
          <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.small, fontWeight: "800" }}>Skills</Text>
          {skills.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm }}>
              {skills.map((skill) => (
                <TouchableOpacity key={skill} activeOpacity={0.86} onPress={() => removeSkill(skill)} disabled={loading}>
                  <Badge label={`${skill} x`} tone="primary" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>No skills added yet.</Text>
          )}
          <View style={{ alignItems: "flex-end", flexDirection: "row", gap: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <InputField label="Add skill" value={skillDraft} onChangeText={setSkillDraft} placeholder="delivery" editable={!loading} onSubmitEditing={addSkill} />
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={addSkill}
              disabled={loading || !skillDraft.trim()}
              style={{
                alignItems: "center",
                backgroundColor: skillDraft.trim() ? COLORS.primary : COLORS.border,
                borderRadius: RADIUS.pill,
                height: 52,
                justifyContent: "center",
                width: 52,
              }}
            >
              <Ionicons name="add" color={COLORS.white} size={23} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ gap: SPACING.sm }}>
          <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>Location</Text>
          <View style={{ flexDirection: "row", gap: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <InputField label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" editable={!loading} />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" editable={!loading} />
            </View>
          </View>
        </View>

        <View style={{ alignItems: "center", backgroundColor: COLORS.background, borderRadius: RADIUS.md, flexDirection: "row", justifyContent: "space-between", padding: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: TYPOGRAPHY.body, fontWeight: "900" }}>Available for shifts</Text>
            <Text style={{ color: COLORS.gray, fontSize: TYPOGRAPHY.small }}>Shown to nearby hirers in realtime.</Text>
          </View>
          <Switch value={isAvailable} onValueChange={setIsAvailable} disabled={loading} thumbColor={isAvailable ? COLORS.primary : COLORS.white} />
        </View>
      </View>

      <ErrorMessage message={error || validationError} />
      <PrimaryButton label="Save profile" onPress={save} loading={loading} disabled={Boolean(validationError)} />
      <SecondaryButton label="Cancel" onPress={navigation.goBack} disabled={loading} />
    </ScreenContainer>
  );
}

function validateProfile(input: {
  fullName: string;
  hourlyRate: string;
  bio: string;
  longitude: string;
  latitude: string;
  skills: string[];
}) {
  if (input.fullName.trim().length < 2) {
    return "Full name must be at least 2 characters.";
  }

  if (input.skills.length > 30) {
    return "You can add up to 30 skills.";
  }

  if (input.bio.trim().length > 300) {
    return "Bio must be 300 characters or less.";
  }

  if (input.hourlyRate.trim()) {
    const rate = Number(input.hourlyRate);
    if (Number.isNaN(rate) || rate < 0) {
      return "Hourly rate must be a valid non-negative number.";
    }
  }

  const hasLongitude = Boolean(input.longitude.trim());
  const hasLatitude = Boolean(input.latitude.trim());
  if (hasLongitude !== hasLatitude) {
    return "Longitude and latitude must be provided together.";
  }

  if (hasLongitude && hasLatitude) {
    const longitude = Number(input.longitude);
    const latitude = Number(input.latitude);
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return "Longitude must be between -180 and 180.";
    }
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return "Latitude must be between -90 and 90.";
    }
  }

  return null;
}

const cardStyle = {
  backgroundColor: COLORS.white,
  borderColor: COLORS.border,
  borderRadius: RADIUS.xl,
  borderWidth: 1,
  gap: SPACING.md,
  padding: SPACING.md,
};
