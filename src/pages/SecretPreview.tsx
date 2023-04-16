import { type RouterOutputs } from "~/utils/api";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";

type LoginSecret = RouterOutputs["example"]["getAllSecret"][number];

export function SecretPreview({ secret }: { secret: LoginSecret }) {
  const qrCodeDataUrl = useQrCode(secret.token);

  return (
    <>
      <div
        key={secret.id}
        className="m-2 flex items-center gap-4 rounded border border-gray-200 p-2"
      >
        <Image src={qrCodeDataUrl} alt="qr-code" width={100} height={100} />
        <div>{secret.status}</div>

        <div>{secret.name}</div>

        <div>
          {secret.createdAt.toLocaleDateString()} <br />
          {secret.createdAt.toLocaleTimeString()}
        </div>
      </div>
    </>
  );
}

export function useQrCode(input: string) {
  const { data } = useQuery(["qr-code", input], () =>
    QRCode.toDataURL(input, { type: "image/png", width: 200, margin: 0 })
  );
  return data ?? "";
}