import { type NextPage } from "next";
import Head from "next/head";



const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        Hello majalis

        <button>hello</button>
      </main>
    </>
  );
};

export default Home;
