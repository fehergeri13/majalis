import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useQrCode } from "~/pages/SecretPreview";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import Image from "next/image";
import Link from "next/link";

export function useGeneratedToken(
  queryKey: string,
  mutate?: (token: string, onSuccess: () => void) => void,
  enabled = true
): string | undefined {
  const router = useRouter();
  const mutateRef = useRefProxy(mutate);

  useEffect(() => {
    if (!enabled) return;
    if (!router.isReady) return;

    if (router.query.gameToken == null || router.query.gameToken == "") {
      const newToken = generateRandomToken();
      router.query[queryKey] = newToken;

      if (mutateRef.current != null) {
        mutateRef.current(newToken, () => {
          router
            .replace({
              query: { ...router.query, [queryKey]: newToken },
            })
            .then(Boolean)
            .catch(Boolean);
        });
      } else {
        router
          .replace({ query: { ...router.query, [queryKey]: newToken } })
          .then(Boolean)
          .catch(Boolean);
      }
    }
  }, [enabled, mutateRef, router, queryKey]);

  return router.query[queryKey] as string | undefined;
}

const Admin: NextPage = () => {
  const [gameToken, setGameToken] = useState<null | string>(null);
  const saveTokenMutation = api.example.saveGameToken.useMutation();

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        <button
          onClick={async () => {
            const newToken = generateRandomToken();
            await saveTokenMutation.mutateAsync({ gameToken: newToken });
            setGameToken(newToken);
          }}
        >
          Generate game QR code
        </button>

        {gameToken != null && (
          <div className="flex items-center gap-4 rounded border p-4">
            <QrCodeImage data={`${getOrigin()}/game/${gameToken ?? ""}`} />
            <Link href={`/game/${gameToken}`}>Open game</Link>
          </div>
        )}
      </main>
    </>
  );
};

export default Admin;

export function useRefProxy<T>(value: T) {
  const ref = useRef<T>(value);

  ref.current = value;

  return ref;
}

export function getOrigin(): string {
  return typeof window !== "undefined" ? window?.location?.origin ?? "" : "";
}

export function generateRandomToken() {
  return uuidV4().replaceAll("-", "");
}

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
