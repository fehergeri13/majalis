import { useRef } from "react";

export function useRefProxy<T>(value: T) {
  const ref = useRef<T>(value);

  ref.current = value;

  return ref;
}