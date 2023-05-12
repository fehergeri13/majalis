export type Override<T, TKey extends keyof T, TValue> = {
  [k in keyof T]: k extends TKey ? TValue : T[k];
};