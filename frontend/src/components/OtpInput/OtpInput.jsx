import { useRef, useEffect } from "react";

export default function OtpInput({ value = "", onChange, length = 6, autoFocus = true }) {
  const inputRefs = useRef([]);

  // Convert current string value into array of digits of given length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    const digitsOnly = val.replace(/\D/g, "");

    if (!digitsOnly) {
      // Cleared input
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    if (digitsOnly.length > 1) {
      // Handle paste of multi-digit string inside single input
      const pastedDigits = digitsOnly.slice(0, length);
      const newDigits = [...digits];
      for (let i = 0; i < pastedDigits.length; i++) {
        newDigits[i] = pastedDigits[i];
      }
      onChange(newDigits.join(""));
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    // Single digit entry
    const newDigits = [...digits];
    newDigits[index] = digitsOnly[0];
    onChange(newDigits.join(""));

    // Auto-advance to next input if available
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move focus backward on backspace if current field is empty
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  return (
    <div className="d-flex justify-content-center gap-2 my-3 mx-auto" style={{ maxWidth: "320px" }} onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i]}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={(e) => e.target.select()}
          className={`form-control text-center fw-bold rounded-3 ${
            digits[i] ? "border-2 border-primary bg-white text-primary shadow-sm" : "border bg-light text-secondary"
          }`}
          style={{
            width: "42px",
            height: "44px",
            fontSize: "1.2rem",
            padding: "0",
            transition: "all 0.15s ease-in-out",
          }}
          aria-label={`Digit ${i + 1} of OTP`}
        />
      ))}
    </div>
  );
}
