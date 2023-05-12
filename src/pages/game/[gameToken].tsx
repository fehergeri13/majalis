import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { usePusher } from "~/utils/pusher";
import { ConnectionDot } from "~/components/ConnectionDot";
import { TeamAdmin } from "~/components/teams/TeamAdmin";
import { BaseAdmin } from "~/components/users/BaseAdmin";
import { SimpleScore } from "~/components/score/SimpleScore";
import { StartStopGame } from "~/components/StartStopGame";
import { EventLog } from "~/components/EventLog";

const Game: NextPage = () => {
  const router = useRouter();
  const gameToken = router.query.gameToken as string;
  const getGameQuery = api.example.getGame.useQuery({ gameToken }, { enabled: gameToken != null });

  const { pusher, isConnected } = usePusher({ type: "admin", authToken: gameToken, autoConnect: true });

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        {getGameQuery.isError && <>There is an error with this game token</>}
        {getGameQuery.isLoading && <>Loading game</>}
        {getGameQuery.isSuccess && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <div>Admin állapota:</div>
              <ConnectionDot isConnected={isConnected} />
            </div>
            <StartStopGame gameToken={gameToken} />
            <BaseAdmin gameToken={gameToken} pusher={pusher} />
            <TeamAdmin gameToken={gameToken} />
            <SimpleScore gameToken={gameToken} pusher={pusher} />
            <EventLog gameToken={gameToken} pusher={pusher} />
          </div>
        )}
      </main>
    </>
  );
};

export default Game;
