import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useQrCode } from "~/pages/SecretPreview";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import Image from "next/image";

const Admin: NextPage = () => {
  const router = useRouter();
  const gameToken = router.query.gameToken as string | undefined;
  const saveGameToken = api.example.saveGameToken.useMutation();
  const tokenQuery = api.example.getToken.useQuery({ gameToken });

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.gameToken == null || router.query.gameToken == "") {
      const newGameToken = uuidV4().replaceAll("-", "");
      router.query.gameToken = newGameToken;

      saveGameToken.mutate(
        { gameToken: newGameToken },
        {
          onSuccess: () => {
            router.replace({
              query: { ...router.query, gameToken: newGameToken },
            }).then(Boolean).catch(Boolean);
          },
        }
      );
    }
  }, [saveGameToken, router]);

  const origin =
    typeof window !== "undefined" ? window?.location?.origin ?? "" : "";
  const qrCodeDataUrl = useQrCode(`${origin}/user/${gameToken ?? ""}`);

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
          {tokenQuery.isSuccess && (
            <Image src={qrCodeDataUrl} alt="qr-code" width={100} height={100} />
          )}

          {tokenQuery.isSuccess && <div>Token alive</div>}
          {tokenQuery.isLoading && <div>Loading...</div>}
          {tokenQuery.isError && (
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
