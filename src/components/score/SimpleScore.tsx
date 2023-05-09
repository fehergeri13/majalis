import { api } from "~/utils/api";
import type { Occupation, Team, User } from "@prisma/client";
import { last } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export function SimpleScore({ gameToken }: { gameToken: string }) {
  const scoreInputQuery = api.example.getScoreInput.useQuery({ gameToken }, { refetchInterval: 100_000 });

  const now = useNow();
  const score = scoreInputQuery.isSuccess ? calcScore({ ...scoreInputQuery.data, until: new Date(now) }) : [];

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
    </>
  );
}

export function calcScore({
  occupations,
  users,
  teams,
  until,
}: {
  occupations: Occupation[];
  teams: Team[];
  users: User[];
  until: Date;
}) {
  const durations = getOccupationDurations({occupations, users, until})

  return teams.map((team) => {
    const score = durations
      .filter((item) => item.teamId === team.id)
      .reduce((sum, curr) => sum + curr.seconds, 0);

    return { team: team, score };
  });
}

function getOccupationDurations({
  occupations,
  users,
  until,
}: {
  occupations: Occupation[];
  users: User[];
  until: Date;
}) {
  type OccupationDuration = { userId: number; teamId: number; seconds: number };
  const occupationDurations: OccupationDuration[] = [];

  for (const user of users) {
    const userOccupations = occupations.filter((occupation) => occupation.userToken === user.userToken);
    const lastOccupation = last(userOccupations);

    if (lastOccupation != null) {
      userOccupations.push({ ...lastOccupation, timestamp: until });

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

function useNow(updateIntervalMs = 100, enabled = true) {
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

export function useRefProxy<T>(value: T) {
  const ref = useRef<T>(value);

  ref.current = value;

  return ref;
}

export function useFunctionRefProxy<F extends (...args: any) => any>(
  handler: (...input: Parameters<F>) => ReturnType<F>
) {
  const savedHandler = useRefProxy(handler);

  return useCallback(
    (...input: Parameters<F>) => {
      return savedHandler.current(...input);
    },
    [savedHandler]
  );
}
