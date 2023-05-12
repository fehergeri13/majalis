import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";
import { TeamSelector } from "~/components/teams/TeamSelector";
import { ConnectionDot } from "~/components/ConnectionDot";

const User: NextPage = () => {
  const router = useRouter();
  const userToken = router.query.userToken as string;

  const getUserQuery = api.example.getUser.useQuery({ userToken }, { enabled: userToken != null });

  const { pusher, isConnected } = usePusher({ type: "user", authToken: userToken });
  usePusherPresenceChannelStore(pusher, "presence-majalis");

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4 h-full">
        {getUserQuery.isError && <>There is an error with this user token</>}
        {getUserQuery.isLoading && <>Loading</>}
        {getUserQuery.isSuccess && (
          <div className="flex flex-col gap-4 h-full">
            <div className="flex gap-8">
              <h1 className="text-3xl">Hello {getUserQuery.data.userName} </h1>{" "}
              <ConnectionDot isConnected={isConnected} />
            </div>
            <div className="grow"/>
            <TeamSelector userToken={userToken} />
          </div>
        )}
      </main>
    </>
  );
};

export default User;
