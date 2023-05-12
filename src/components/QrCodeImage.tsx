import { useQrCode } from "~/components/useQrCode";
import Image from "next/image";

export function QrCodeImage({
  data,
  width = 100,
  height = 100,
}: {
  data: string;
  width?: number;
  height?: number;
}) {
  const qrCodeDataUrl = useQrCode(data);
  return <Image src={qrCodeDataUrl} alt="qr-code" width={width} height={height} />;
}
