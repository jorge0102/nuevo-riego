import { useState, useCallback } from 'react';

export function useVirtualKeyboard() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardValue, setKeyboardValue] = useState('');
  const [onCommit, setOnCommit] = useState<((val: string) => void) | null>(null);

  const openKeyboard = useCallback((currentValue: string, commit: (val: string) => void) => {
    setKeyboardValue(currentValue);
    setOnCommit(() => commit);
    setKeyboardVisible(true);
  }, []);

  const closeKeyboard = useCallback(() => {
    setKeyboardVisible(false);
  }, []);

  const handleChange = useCallback((val: string) => {
    setKeyboardValue(val);
    onCommit?.(val);
  }, [onCommit]);

  return { keyboardVisible, keyboardValue, openKeyboard, closeKeyboard, handleChange };
}
