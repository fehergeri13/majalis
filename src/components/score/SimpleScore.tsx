import { api } from "~/utils/api";
import type { Occupation, Team, User } from "@prisma/client";
import { last } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { isWithinInterval } from "date-fns";
import { SimpleChart } from "~/components/score/SimpleChart";
import { useRefProxy } from "~/utils/useRefProxy";
import type Pusher from "pusher-js";
import { usePusherBinding, usePusherChannel } from "~/utils/pusher";

export function SimpleScore({ gameToken, pusher }: { gameToken: string; pusher: Pusher | null }) {
  const game = api.example.getGame.useQuery({ gameToken });
  const scoreInputQuery = api.example.getScoreInput.useQuery({ gameToken }, { refetchInterval: 100_000 });

  const now = useNow();
  const start = game.isSuccess ? game.data.startedAt ?? new Date(now) : new Date(now);
  const end = game.isSuccess ? game.data.stoppedAt ?? new Date(now + 1) : new Date(now + 1);
  const score = scoreInputQuery.isSuccess ? calcScore({ ...scoreInputQuery.data, start, end }) : [];


  const channel = usePusherChannel(pusher, "private-majalis")
  usePusherBinding(channel, "client-base-update", () => scoreInputQuery.refetch())

  return (
    <>
      {scoreInputQuery.isSuccess && (
        <>
          <ul>
            {score.map((item) => (
              <li className="flex items-center gap-2" key={item.team.id}>
                <div>team: {item.team.name}</div>
                <div>score: {item.score}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      <SimpleChart gameToken={gameToken} />
    </>
  );
}

export function calcScore({
  occupations,
  users,
  teams,
  start,
  end,
}: {
  occupations: Occupation[];
  teams: Team[];
  users: User[];
  start: Date;
  end: Date;
}) {
  const durations = getOccupationDurations({ occupations, users, start, end });

  return teams.map((team) => {
    const score = durations
      .filter((item) => item.teamId === team.id)
      .reduce((sum, curr) => sum + curr.seconds, 0);

    return { team: team, score };
  });
}

type OccupationDuration = { userId: number; teamId: number | null; seconds: number };
function getOccupationDurations({
  occupations,
  users,
  start,
  end,
}: {
  occupations: Occupation[];
  users: User[];
  start: Date;
  end: Date;
}) {
  const occupationDurations: OccupationDuration[] = [];

  for (const user of users) {
    const userOccupations = occupations.filter(
      (occupation) =>
        occupation.userToken === user.userToken && isWithinInterval(occupation.timestamp, { start, end })
    );
    const lastOccupation = last(userOccupations);

    if (lastOccupation != null) {
      userOccupations.push({ ...lastOccupation, timestamp: end });

      // iterate through except last item
      for (let i = 0; i < userOccupations.length - 1; i++) {
        const current = userOccupations[i];
        const next = userOccupations[i + 1];

        if (current != null && next != null) {
          const millis = next.timestamp.valueOf() - current.timestamp.valueOf();
          const seconds = Math.floor(millis / 100);
          occupationDurations.push({ userId: user.id, teamId: current.teamNumber, seconds });
        }
      }
    }
  }

  return occupationDurations;
}

export function useNow(updateIntervalMs = 100, enabled = true) {
  const [now, setNow] = useState(Date.now());
  useInterval(() => setNow(Date.now()), updateIntervalMs, enabled);

  return now;
}

export function useInterval(callback: () => void, intervalMs: number, enabled = true) {
  const callbackRef = useFunctionRefProxy(callback);

  useEffect(() => {
    if (!enabled) return;
    const intervalRef = setInterval(callbackRef, intervalMs);
    return () => clearInterval(intervalRef);
  }, [callbackRef, intervalMs, enabled]);
}

export function useFunctionRefProxy<TArgs extends unknown[], TReturn>(handler: (...input: TArgs) => TReturn) {
  const savedHandler = useRefProxy(handler);

  return useCallback(
    (...input: TArgs) => {
      return savedHandler.current(...input);
    },
    [savedHandler]
  );
}
