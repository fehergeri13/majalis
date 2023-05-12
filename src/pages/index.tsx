import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "~/utils/api";
import { generateRandomToken } from "~/utils/generateRandomToken";
import { QrCodeImage } from "~/components/QrCodeImage";
import { getOrigin } from "~/utils/getOrigin";
import Link from "next/link";

const Home: NextPage = () => {
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
        <h2 className="text-xl my-4">Capture the flag game</h2>
        <button
          className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
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

export default Home;
