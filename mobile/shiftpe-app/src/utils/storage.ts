import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async getString(key: string) {
    return AsyncStorage.getItem(key);
  },

  async setString(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },

  async getJson<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  },

  async setJson<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },

  async multiRemove(keys: string[]) {
    await AsyncStorage.multiRemove(keys);
  },
};
