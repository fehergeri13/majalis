import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";
import { TeamSelector } from "~/components/teams/TeamSelector";

const User: NextPage = () => {
  const router = useRouter();
  const userToken = router.query.userToken as string;

  const getUserQuery = api.example.getUser.useQuery({ userToken });

  const { pusher, isConnected } = usePusher({ type: "user", authToken: userToken });
  usePusherPresenceChannelStore(pusher, "presence-majalis");

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        {getUserQuery.isError && <>There is an error with this user token</>}

        {getUserQuery.isLoading && <>Loading</>}

        {getUserQuery.isSuccess && <h1>Hello {getUserQuery.data.userName}</h1>}

        <TeamSelector userToken={userToken} />
      </main>
    </>
  );
};

export default User;
