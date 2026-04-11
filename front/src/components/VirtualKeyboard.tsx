import React, { useState } from 'react';

interface VirtualKeyboardProps {
  inputValue: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

const ROWS_DEFAULT = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l','ñ'],
  ['z','x','c','v','b','n','m',',','.'],
];

const ROWS_SHIFT = [
  ['!','"','#','$','%','&','/','(',')','='],
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['Z','X','C','V','B','N','M',';',':'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ inputValue, onChange, onClose }) => {
  const [shift, setShift] = useState(false);

  const rows = shift ? ROWS_SHIFT : ROWS_DEFAULT;

  const press = (key: string) => {
    onChange(inputValue + key);
    if (shift) setShift(false);
  };

  const backspace = () => {
    onChange(inputValue.slice(0, -1));
  };

  const btnCls = 'flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium shadow-sm border border-gray-300 dark:border-gray-600 active:bg-gray-200 dark:active:bg-gray-600 select-none cursor-pointer';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 shadow-2xl p-2 pb-3">
      {/* Fila preview + cerrar */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 truncate">
          {inputValue || <span className="text-gray-400">...</span>}
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold"
        >
          OK ✓
        </button>
      </div>

      {/* Filas de teclas */}
      <div className="flex flex-col gap-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {row.map((key) => (
              <button
                key={key}
                onPointerDown={(e) => { e.preventDefault(); press(key); }}
                className={`${btnCls} h-10`}
                style={{ minWidth: 32, flex: '1 1 0' }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Fila inferior: shift, espacio, borrar */}
        <div className="flex gap-1 justify-center">
          <button
            onPointerDown={(e) => { e.preventDefault(); setShift((s) => !s); }}
            className={`${btnCls} h-10 px-3 ${shift ? 'bg-primary text-white border-primary' : ''}`}
            style={{ minWidth: 56 }}
          >
            ⇧
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); press(' '); }}
            className={`${btnCls} h-10`}
            style={{ flex: '4 1 0' }}
          >
            Espacio
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); backspace(); }}
            className={`${btnCls} h-10 px-3`}
            style={{ minWidth: 56 }}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
};
