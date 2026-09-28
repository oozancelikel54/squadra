import AsyncStorage from '@react-native-async-storage/async-storage';

export const TUTORIAL_SEEN_KEY = '@lineupbuilder/tutorialSeen';

export async function getTutorialSeen() {
  try {
    const value = await AsyncStorage.getItem(TUTORIAL_SEEN_KEY);
    return value === '1';
  } catch (e) {
    return false;
  }
}

export async function setTutorialSeen(seen = true) {
  try {
    await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, seen ? '1' : '0');
  } catch (e) {
    // ignore
  }
}
