import { Stack } from 'expo-router';
import { Provider } from 'jotai';

export default function RootLayout() {
  return (
    <Provider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="schedule" options={{ headerShown: false }} />
        <Stack.Screen name="sector/[id]" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
