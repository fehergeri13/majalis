import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";

export function useQrCode(input: string) {
  const { data } = useQuery(["qr-code", input], () =>
    QRCode.toDataURL(input, { type: "image/png", width: 200, margin: 0 })
  );

  // smallest svg data https://stackoverflow.com/a/31367135
  return data ?? "data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"/>";
}