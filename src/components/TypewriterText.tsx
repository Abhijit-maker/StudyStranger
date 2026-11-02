import React, { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per chunk
  chunkSize?: number; // characters per step
  enabled?: boolean;
  onComplete?: () => void;
  className?: string;
  cursorClassName?: string;
  showCursor?: boolean;
}

/**
 * Smooth, high-performance TypewriterText component.
 * Reveals AI mentor response gradually with an animated glowing cursor.
 * If enabled is false (or when completed), full text is shown immediately.
 * Clicking or tapping allows the user to instantly skip to the end of the text.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 18,
  chunkSize = 2,
  enabled = true,
  onComplete,
  className = "",
  cursorClassName = "inline-block w-1.5 h-3.5 bg-indigo-500 ml-0.5 align-middle animate-pulse",
  showCursor = true,
}) => {
  const [displayedLength, setDisplayedLength] = useState<number>(() =>
    enabled ? 0 : text.length
  );
  const [isTyping, setIsTyping] = useState<boolean>(() => enabled && text.length > 0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      return;
    }

    setDisplayedLength(0);
    setIsTyping(true);

    if (!text) {
      setIsTyping(false);
      return;
    }

    let current = 0;
    // Adapt speed: If text is long, speed up dynamically so it doesn't take too long
    const effectiveChunkSize = text.length > 300 ? Math.max(chunkSize, 4) : chunkSize;
    const effectiveSpeed = text.length > 300 ? Math.max(8, speed - 8) : speed;

    const interval = setInterval(() => {
      current += effectiveChunkSize;
      if (current >= text.length) {
        setDisplayedLength(text.length);
        setIsTyping(false);
        clearInterval(interval);
        onCompleteRef.current?.();
      } else {
        setDisplayedLength(current);
      }
    }, effectiveSpeed);

    return () => clearInterval(interval);
  }, [text, enabled, speed, chunkSize]);

  const handleSkip = () => {
    if (isTyping) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      onCompleteRef.current?.();
    }
  };

  const displayText = text.slice(0, displayedLength);

  return (
    <span
      onClick={handleSkip}
      className={`cursor-pointer select-text ${className}`}
      title={isTyping ? "Click to reveal all immediately" : undefined}
    >
      {displayText}
      {isTyping && showCursor && (
        <span className={cursorClassName} aria-hidden="true" />
      )}
    </span>
  );
};
