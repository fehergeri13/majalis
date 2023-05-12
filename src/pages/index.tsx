import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "~/utils/api";
import { generateRandomToken } from "~/utils/generateRandomToken";
import { QrCodeImage } from "~/components/QrCodeImage";
import { getOrigin } from "~/utils/getOrigin";
import Link from "next/link";
import { IconExternalLink, IconFlagFilled } from "@tabler/icons-react";
import { HiddenQrCode } from "~/components/HiddenQrCode";

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
      <main className="space-y-4 p-4">
        <h1 className="my-4 flex items-end text-3xl">
          Capture the flag! <IconFlagFilled className="inline-block h-16 w-16" />
        </h1>
        <h2>
          Üdv a <span>Capture the flag</span> játékban!
        </h2>
        <p className="my-4">A játék elkezdéséhez csinálni kell egy szobát, ahol majd lehet játszani.</p>
        <button
          className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
          onClick={async () => {
            const newToken = generateRandomToken();
            await saveTokenMutation.mutateAsync({ gameToken: newToken });
            setGameToken(newToken);
          }}
        >
          Játék szoba készítése
        </button>

        {gameToken != null && (
          <div className="flex items-center gap-4 rounded border p-4">
            <HiddenQrCode data={`${getOrigin()}/game/${gameToken ?? ""}`} />
            <Link href={`/game/${gameToken}`}>
              Szoba megnyitása
              <IconExternalLink className="ml-2 inline-block h-5 w-5 text-gray-600" />
            </Link>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
