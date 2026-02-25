import { Stack } from 'expo-router';
import { Provider } from 'jotai';

export default function RootLayout() {
  return (
    <Provider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="sector/[id]" />
      </Stack>
    </Provider>
  );
}
