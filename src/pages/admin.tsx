import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useQrCode } from "~/pages/SecretPreview";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { v4 as uuidV4 } from "uuid";
import Image from "next/image";

export function getOrigin(): string {
  return typeof window !== "undefined" ? window?.location?.origin ?? "" : "";
}

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
      const newToken = uuidV4().replaceAll("-", "");
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
  const router = useRouter();

  const gameToken = useGeneratedToken("gameToken", (gameToken, onSuccess) => {
    saveTokenMutation.mutate({ gameToken }, { onSuccess });
  });

  const saveTokenMutation = api.example.saveGameToken.useMutation();
  const getTokenQuery = api.example.checkGameToken.useQuery({ gameToken });

  const qrCodeDataUrl = useQrCode(`${getOrigin()}/game/${gameToken ?? ""}`);

  const { pusher } = usePusher({
    gameToken: gameToken,
    userName: "admin",
  });
  const store = usePusherPresenceChannelStore(pusher, "presence-majalis");

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        <div className="flex items-center gap-4 rounded border p-4">
          {getTokenQuery.isSuccess && (
            <Image src={qrCodeDataUrl} alt="qr-code" width={100} height={100} />
          )}

          {getTokenQuery.isSuccess && <div>Token alive</div>}
          {getTokenQuery.isLoading && <div>Loading...</div>}
          {getTokenQuery.isError && (
            <div>
              Token not found
              <button
                onClick={() => {
                  void router.replace({
                    query: { ...router.query, gameToken: "" },
                  });
                }}
                className="m-1 rounded bg-gray-200 px-2 py-1"
              >
                Reset token
              </button>
            </div>
          )}
        </div>

        {store.members.map((member) => (
          <div key={member}>member: {member}</div>
        ))}
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
