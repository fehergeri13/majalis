import { api } from "~/utils/api";
import { type Occupation } from "@prisma/client";
import { format } from "date-fns";
import React, { useState } from "react";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import { usePusherBinding, usePusherChannel } from "~/utils/pusher";
import type Pusher from "pusher-js";

export function EventLog({ gameToken, pusher }: { gameToken: string; pusher: Pusher | null }) {
  const [isFullScreen, setFullScreen] = useState(false);
  const allOccupation = api.example.getAllOccupation.useQuery({ gameToken });

  const channel = usePusherChannel(pusher, "private-majalis");
  usePusherBinding(channel, "client-base-update", () => allOccupation.refetch());

  return (
    <div
      className={`flex flex-col rounded border border-gray-400 p-2 ${
        isFullScreen ? "fixed inset-0 bg-white" : "relative"
      }`}
    >
      <button
        className="absolute right-0 top-0 rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 active:bg-gray-400"
        onClick={() => setFullScreen((state) => !state)}
      >
        {!isFullScreen && <IconArrowsMaximize className="h-8 w-8" />}
        {isFullScreen && <IconArrowsMinimize className="h-8 w-8" />}
      </button>
      <h2 className="mb-4 text-xl">Történések:</h2>

      <div>
        {allOccupation.data?.map((item) => (
          <EventItem key={item.id} gameToken={gameToken} occupation={item} />
        ))}
      </div>
    </div>
  );
}

export function EventItem({ gameToken, occupation }: { gameToken: string; occupation: Occupation }) {
  const allUser = api.example.getAllUser.useQuery({ gameToken });
  const allTeam = api.example.getAllTeam.useQuery({ gameToken });

  const userName =
    allUser.data?.find((user) => user.userToken === occupation.userToken)?.userName ?? "Ismeretlen nevű";
  const z = /^[aeiouöüóőúáűíé]/i.test(userName) ? "z" : "";

  const teamName =
    allTeam?.data?.find((team) => team.id === occupation.teamNumber)?.name ?? "Ismeretlen csapat";

  const z2 = /^[aeiouöüóőúáűíé]/i.test(teamName) ? "z" : "";

  return (
    <>
      {occupation.teamNumber == null ? (
        <>
          <div className="flex items-center">
            <div className="mr-4 inline-block w-[50px]">{format(occupation.timestamp, "HH: mm")}</div>A{z}
            <div className="border border-gray-200 px-1">{userName}</div>
            bázis felszabadult.
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center">
            <div className="mr-4 w-[50px] ">{format(occupation.timestamp, "HH: mm")}</div>A{z}
            <div className="rounded border border-gray-200 px-1">{userName}</div>
            bázist elfoglalta a{z2} {teamName} csapat
          </div>
        </>
      )}
    </>
  );
}
