import { useState } from "react";
import { IconQrcode } from "@tabler/icons-react";
import { QrCodeImage } from "~/components/QrCodeImage";

export function HiddenQrCode({
  data,
  width = 100,
  height = 100,
}: {
  data: string;
  width?: number;
  height?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="cursor-pointer select-none" onClick={() => setVisible((prev) => !prev)}>
      {visible && <QrCodeImage data={data} width={width} height={height} />}
      {!visible && <IconQrcode className="h-10 w-10 bg-gray-200 text-gray-400 hover:text-gray-500" />}
    </div>
  );
}
