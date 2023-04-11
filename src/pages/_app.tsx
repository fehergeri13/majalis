import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { pusherWebClient } from "~/utils/pusher";
import { PresenceChannel } from "pusher-js";


const slug = "majalis";
const channel = pusherWebClient.subscribe(slug)
const presenceChannel = pusherWebClient.subscribe(
  `presence-${slug}`
) as PresenceChannel


const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
