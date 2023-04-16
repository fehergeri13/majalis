import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/Image";
import { api } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";

const Admin: NextPage = () => {
  const secrets = api.example.getAllSecret.useQuery();
  const createSecret = api.example.createSecret.useMutation({
    onSuccess: async () => {
      await secrets.refetch();
    },
  });

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        Admin app secrets
        {secrets.data?.map((secret) => (
          <SecretPreview secret={secret} key={secret.id} />
        ))}
        <button
          className="block rounded bg-gray-200 px-2 py-1"
          onClick={() => {
            createSecret.mutate();
          }}
        >
          Add secret
        </button>
      </main>
    </>
  );
};
function SecretPreview({
  secret,
}: {
  secret: { id: number; token: string; name: string; createdAt: Date, status: "NEW"  | "CONNECTED" | "DISCONNECTED" };
}) {
  const qrCodeDataUrl = useQrCode(secret.token);

  return (
    <>
      <div
        key={secret.id}
        className="m-2 flex items-center rounded border border-gray-200 p-2 gap-4"
      >
        <Image src={qrCodeDataUrl} alt="qr-code" width={100} height={100} />
        <div>{secret.status}</div>

        <div>{secret.name}</div>

        <div>
          {secret.createdAt.toLocaleDateString()} <br/>
          {secret.createdAt.toLocaleTimeString()}
        </div>
      </div>
    </>
  );
}

function sleepMs(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function useQrCode(input: string) {
  const { data } = useQuery(["qr-code", input], () =>
    QRCode.toDataURL(input, { type: "image/png", width: 200, margin: 0 })
  );
  return data ?? "";
}

export default Admin;
