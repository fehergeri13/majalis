import { type NextPage } from "next";
import Head from "next/head";
import { pusherStore } from "~/utils/pusher";
import { useStore } from "zustand";



const Home: NextPage = () => {

  const pusherState = useStore(pusherStore)

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        Hello majalis

        {pusherState.members.map(member => <div>member: {member}</div>)}

        <button>hello</button>
      </main>
    </>
  );
};

export default Home;
