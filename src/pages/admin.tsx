import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { SecretPreview } from "~/pages/SecretPreview";

const Admin: NextPage = () => {
  const secrets = api.example.getAllSecret.useQuery();
  const createSecret = api.example.createSecret.useMutation({
    onSuccess: async () => {
      await secrets.refetch();
    },
  });

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
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
      </main>
    </>
  );
};


export default Admin;
