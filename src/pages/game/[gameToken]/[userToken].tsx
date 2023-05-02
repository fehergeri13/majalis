import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useState } from "react";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";

const User: NextPage = () => {
  const router = useRouter();
  const gameToken = router.query.gameToken as string;
  const userToken = router.query.userToken as string;

  const [userName, setUserName] = useState("");

  const getGameQuery = api.example.getGame.useQuery({ gameToken });
  const getUserQuery = api.example.getUser.useQuery(
    { gameToken, userToken },
    {
      enabled: getGameQuery.isSuccess,
      onSuccess: (data) => {
        setUserName(data.userName);
      },
    }
  );
  const saveUserNameMutation = api.example.saveUserName.useMutation();

  const { pusher, isConnected } = usePusher({ gameToken, userToken });
  usePusherPresenceChannelStore(pusher, "presence-majalis");

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        {getGameQuery.isError && <>There is an error with this game token</>}
        {getUserQuery.isError && <>There is an error with this user token</>}

        {getGameQuery.isLoading || (getUserQuery.isLoading && <>Loading</>)}

        {getUserQuery.isSuccess && (
          <div>
            <div className="flex items-baseline">
              <div className="mr-1">Hello</div>
              <input
                type="text"
                onChange={(e) => setUserName(e.target.value)}
                className="block rounded border border-gray-200 px-2 py-1"
                value={userName}
              />
              {userName !== getUserQuery.data?.userName  && (
                <button
                  className="ml-2 border-gray-200 rounded bg-blue-500 px-2 py-1 text-white"
                  disabled={saveUserNameMutation.isLoading}
                  onClick={async () => {
                    await saveUserNameMutation.mutateAsync({ gameToken, userToken, userName });
                    setUserName(userName)
                    await getUserQuery.refetch();
                  }}
                >
                  {saveUserNameMutation.isLoading && "Loading"}
                  {!saveUserNameMutation.isLoading && "Save"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default User;
