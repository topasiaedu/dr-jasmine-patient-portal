"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";

interface NumberStepperProps {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  labelZh: string;
  defaultValue?: number;
  inputMode?:
    | "numeric"
    | "decimal"
    | "none"
    | "tel"
    | "search"
    | "email"
    | "url"
    | "text";
}

/**
 * NumberStepper — premium tactile +/- input for patient health readings.
 * +/- buttons use a warm gradient with press animation.
 * Value is displayed large and bold; unit shown as a warm pill below.
 */
export function NumberStepper({
  value,
  onChange,
  step,
  min,
  max,
  unit,
  label,
  labelZh,
  defaultValue,
  inputMode = "decimal",
}: NumberStepperProps) {
  const [inputValue, setInputValue] = useState(
    value === 0 && defaultValue !== undefined && defaultValue !== 0
      ? defaultValue.toString()
      : value === 0
      ? ""
      : value.toString()
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value === 0 && defaultValue !== undefined && defaultValue !== 0) {
      onChange(defaultValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(
        value === 0 && defaultValue !== undefined && defaultValue !== 0
          ? defaultValue.toString()
          : value === 0
          ? ""
          : value.toString()
      );
    }
  }, [value, isFocused, defaultValue]);

  const handleBlur = () => {
    setIsFocused(false);
    let num = parseFloat(inputValue);
    if (isNaN(num)) {
      num = 0;
    } else {
      num = Math.max(min, Math.min(max, num));
      const stepStr = step.toString();
      const precision = stepStr.includes(".")
        ? stepStr.split(".")[1].length
        : 0;
      num = Number(num.toFixed(precision));
    }
    setInputValue(num === 0 ? "" : num.toString());
    onChange(num);
  };

  const handleMinus = () => {
    const next = Math.max(min, value - step);
    const stepStr = step.toString();
    const precision = stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
    onChange(Number(next.toFixed(precision)));
  };

  const handlePlus = () => {
    const next = Math.min(max, value + step);
    const stepStr = step.toString();
    const precision = stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
    onChange(Number(next.toFixed(precision)));
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Bilingual label — English bold above, Chinese secondary below */}
      <div className="text-center mb-8">
        <h2 className="text-lg font-semibold text-[#1C1917]">{label}</h2>
        <p className="text-base text-[#78716C]">{labelZh}</p>
      </div>

      <div
        className="flex items-center justify-center gap-8 w-full"
        role="group"
        aria-label={`${label} input`}
      >
        {/* Minus button — tactile gradient with press animation */}
        <button
          aria-label={`Decrease ${label}`}
          onClick={handleMinus}
          disabled={value <= min}
          className={[
            "min-w-[56px] min-h-[56px] rounded-2xl",
            "bg-gradient-to-b from-[#E8E4DF] to-[#DDD8D2]",
            "border border-[rgba(28,25,23,0.1)]",
            "shadow-sm",
            "flex items-center justify-center",
            "transition-all duration-100",
            "active:scale-[0.95] active:shadow-none active:from-[#DDD8D2] active:to-[#CCC8C2]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <Minus size={24} className="text-[#1C1917]" strokeWidth={2.5} />
        </button>

        {/* Value display — large, bold, warm dark */}
        <div
          className="relative flex flex-col items-center justify-center min-w-[120px]"
          aria-live="polite"
        >
          <input
            type="number"
            inputMode={inputMode}
            value={inputValue}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onChange={(e) => setInputValue(e.target.value)}
            className="text-[56px] font-extrabold leading-none text-[#1C1917] tabular-nums tracking-tight text-center bg-transparent border-none appearance-none focus:outline-none focus:ring-0 w-32 p-0 m-0 [&::-webkit-inner-spin-button]:appearance-none min-w-0"
            style={{ MozAppearance: "textfield" }}
            aria-label={label}
          />
          {/* Unit pill below value */}
          <span className="mt-2 rounded-full bg-[#EDE8E1] px-3 py-1 text-sm font-medium text-[#78716C]">
            {unit}
          </span>
        </div>

        {/* Plus button — same tactile gradient */}
        <button
          aria-label={`Increase ${label}`}
          onClick={handlePlus}
          disabled={value >= max}
          className={[
            "min-w-[56px] min-h-[56px] rounded-2xl",
            "bg-gradient-to-b from-[#E8E4DF] to-[#DDD8D2]",
            "border border-[rgba(28,25,23,0.1)]",
            "shadow-sm",
            "flex items-center justify-center",
            "transition-all duration-100",
            "active:scale-[0.95] active:shadow-none active:from-[#DDD8D2] active:to-[#CCC8C2]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <Plus size={24} className="text-[#1C1917]" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
