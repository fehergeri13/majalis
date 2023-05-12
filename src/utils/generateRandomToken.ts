import { v4 as uuidV4 } from "uuid";

export function generateRandomToken() {
  return uuidV4().replaceAll("-", "");
}