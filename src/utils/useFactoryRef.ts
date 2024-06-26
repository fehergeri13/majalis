import React, { useRef } from "react";

const SENTINEL = {};

export function useFactoryRef<T>(init: () => T) {
  const ref = useRef<T | typeof SENTINEL>(SENTINEL);
  if (ref.current === SENTINEL) {
    ref.current = init();
  }

  return ref as React.MutableRefObject<T>;
}
