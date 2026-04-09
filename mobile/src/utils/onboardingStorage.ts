import AsyncStorage from '@react-native-async-storage/async-storage'

const ANSWERS_KEY = '@pulsepro:onboarding-answers'

export async function saveOnboardingAnswers(
  userId: string,
  answers: Record<string, string | string[]>
) {
  await AsyncStorage.setItem(
    `${ANSWERS_KEY}-${userId}`,
    JSON.stringify(answers)
  )
}

export async function getOnboardingAnswers(
  userId: string
): Promise<Record<string, string | string[]> | null> {
  const raw = await AsyncStorage.getItem(`${ANSWERS_KEY}-${userId}`)
  return raw ? JSON.parse(raw) : null
}
