import React, { useEffect, useRef, useState } from 'react';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

interface VirtualKeyboardProps {
  inputValue: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ inputValue, onChange, onClose }) => {
  const keyboardRef = useRef<Keyboard | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'default' | 'shift'>('default');

  useEffect(() => {
    if (!divRef.current) return;
    keyboardRef.current = new Keyboard(divRef.current, {
      onChange: (input) => onChange(input),
      onKeyPress: (button: string) => {
        if (button === '{shift}' || button === '{lock}') {
          setLayout((prev) => (prev === 'default' ? 'shift' : 'default'));
        }
        if (button === '{enter}') onClose();
      },
      layout: {
        default: [
          '1 2 3 4 5 6 7 8 9 0 {bksp}',
          'q w e r t y u i o p',
          'a s d f g h j k l ñ',
          '{shift} z x c v b n m , . {shift}',
          '{space} {enter}',
        ],
        shift: [
          '! " # $ % & / ( ) = {bksp}',
          'Q W E R T Y U I O P',
          'A S D F G H J K L Ñ',
          '{shift} Z X C V B N M ; : {shift}',
          '{space} {enter}',
        ],
      },
      display: {
        '{bksp}': '⌫',
        '{shift}': '⇧',
        '{space}': 'Espacio',
        '{enter}': '✓ OK',
        '{lock}': 'Caps',
      },
      theme: 'hg-theme-default hg-layout-default',
      layoutName: layout,
    });

    keyboardRef.current.setInput(inputValue);

    return () => {
      keyboardRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    keyboardRef.current?.setOptions({ layoutName: layout });
  }, [layout]);

  useEffect(() => {
    if (keyboardRef.current && keyboardRef.current.getInput() !== inputValue) {
      keyboardRef.current.setInput(inputValue);
    }
  }, [inputValue]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-100 dark:bg-gray-800 shadow-2xl border-t border-gray-300 dark:border-gray-600">
      <div className="flex justify-end px-3 pt-2">
        <button
          onClick={onClose}
          className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Cerrar ✕
        </button>
      </div>
      <div ref={divRef} className="p-2" />
    </div>
  );
};
