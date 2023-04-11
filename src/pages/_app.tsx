import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { hello, pusherWebClient } from "~/utils/pusher";
import { PresenceChannel } from "pusher-js";


hello()



const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
