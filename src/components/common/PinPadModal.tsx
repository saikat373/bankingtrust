import React, { useState, useEffect } from 'react';
import { ShieldAlert, Delete, CheckCircle2, Shuffle, Lock } from 'lucide-react';
import { Modal } from './Modal';
import { shuffleArray } from '../../utils/security';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => void;
  title?: string;
  actionDescription?: string;
  expectedPinLength?: number;
  randomizeKeypad?: boolean;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  title = 'Security PIN Verification',
  actionDescription = 'Please enter your 4-digit Transaction Security PIN to authorize this action.',
  expectedPinLength = 4,
  randomizeKeypad = true,
}) => {
  const [pin, setPin] = useState<string>('');
  const [keypadDigits, setKeypadDigits] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
  const [isScrambled, setIsScrambled] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      if (randomizeKeypad && isScrambled) {
        setKeypadDigits(shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
      } else {
        setKeypadDigits([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
      }
    }
  }, [isOpen, randomizeKeypad, isScrambled]);

  // Handle keyboard typing as well
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < expectedPinLength) {
          setPin((prev) => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter' && pin.length === expectedPinLength) {
        onVerify(pin);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, pin, expectedPinLength, onVerify]);

  const handleDigitClick = (num: number) => {
    if (pin.length < expectedPinLength) {
      const nextPin = pin + num;
      setPin(nextPin);
      // Auto verify when length reached
      if (nextPin.length === expectedPinLength) {
        setTimeout(() => {
          onVerify(nextPin);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const toggleScramble = () => {
    if (!isScrambled) {
      setKeypadDigits(shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
      setIsScrambled(true);
    } else {
      setKeypadDigits([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
      setIsScrambled(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center">
        {/* Security badge */}
        <div className="mb-3 flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          <Lock className="h-3.5 w-3.5" />
          <span>256-Bit Encrypted Authentication</span>
        </div>

        <p className="text-center text-xs text-slate-500 mb-6">{actionDescription}</p>

        {/* PIN Indicators */}
        <div className="mb-6 flex gap-4">
          {Array.from({ length: expectedPinLength }).map((_, index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'scale-110 bg-bank-600 ring-4 ring-bank-100'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Demo PIN hint */}
        <div className="mb-4 text-center">
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            Demo Customer PIN: <strong className="text-slate-700">7788</strong> | Admin: <strong className="text-slate-700">1234</strong>
          </span>
        </div>

        {/* Scramble keypad toggle */}
        <div className="mb-4 flex items-center justify-between w-full px-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            Keylogger Defense
          </span>
          <button
            type="button"
            onClick={toggleScramble}
            className="flex items-center gap-1 font-medium text-bank-600 hover:text-bank-800 transition"
          >
            <Shuffle className="h-3 w-3" />
            {isScrambled ? 'Scrambled' : 'Standard'}
          </button>
        </div>

        {/* Virtual Pin Pad Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
          {keypadDigits.slice(0, 9).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitClick(num)}
              className="h-14 rounded-xl bg-slate-50 border border-slate-200 text-xl font-bold text-slate-800 shadow-sm transition hover:bg-bank-50 hover:border-bank-300 hover:text-bank-700 active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, Last digit, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-xl bg-slate-100 text-xs font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 active:scale-95 flex items-center justify-center"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleDigitClick(keypadDigits[9])}
            className="h-14 rounded-xl bg-slate-50 border border-slate-200 text-xl font-bold text-slate-800 shadow-sm transition hover:bg-bank-50 hover:border-bank-300 hover:text-bank-700 active:scale-95 flex items-center justify-center"
          >
            {keypadDigits[9]}
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 active:scale-95 flex items-center justify-center"
            aria-label="Backspace"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Confirm button */}
        <div className="mt-6 flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pin.length !== expectedPinLength}
            onClick={() => onVerify(pin)}
            className="flex-1 rounded-xl bg-bank-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-bank-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Verify
          </button>
        </div>
      </div>
    </Modal>
  );
};
