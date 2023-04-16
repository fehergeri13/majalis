import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { SecretPreview } from "~/pages/SecretPreview";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";

const Admin: NextPage = () => {
  const secrets = api.example.getAllSecret.useQuery();
  const createSecret = api.example.createSecret.useMutation({
    onSuccess: async () => {
      await secrets.refetch();
    },
  });

  const { pusher } = usePusher("admin", "admin");
  const store = usePusherPresenceChannelStore(pusher, "presence-majalis");

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
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
        <hr />
        {store.members.map((member) => (
          <div key={member}>member: {member}</div>
        ))}
      </main>
    </>
  );
};

export default Admin;
