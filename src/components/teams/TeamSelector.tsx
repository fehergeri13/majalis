import { api } from "~/utils/api";
import { type Team } from "@prisma/client";

type TeamOrEmpty = Override<Team, "id", number | null>;

export function TeamSelector({ gameToken, userToken }: { gameToken: string; userToken: string }) {
  const allTeamQuery = api.example.getAllTeam.useQuery({ gameToken });
  const getOccupationQuery = api.example.getOccupation.useQuery({ gameToken, userToken });

  const teams: TeamOrEmpty[] = allTeamQuery.isSuccess
    ? [...allTeamQuery.data, { gameToken, name: "No occupation", id: null, color: "#ddd" }]
    : [];

  return (
    <>
      <div className="my-8 border-y border-gray-400 py-2">
        <h3 className="mb-4 text-xl">Current status</h3>
        {getOccupationQuery.isSuccess && <OccupationDisplay team={getOccupationQuery.data} />}

        <h3 className="my-4 text-xl">Teams</h3>

        <ul className="flex flex-col gap-2">
          {teams.map((team) => (
            <TeamSelectorItem
              key={team.id}
              team={team}
              onChange={getOccupationQuery.refetch}
              gameToken={gameToken}
              userToken={userToken}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

export function TeamSelectorItem({
  team,
  onChange,
  gameToken,
  userToken,
}: {
  team: TeamOrEmpty;
  onChange: () => void;
  gameToken: string;
  userToken: string;
}) {
  const occupyBaseMutation = api.example.occupyBase.useMutation();

  return (
    <li className="flex items-center gap-2">
      <button
        className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
        style={{ backgroundColor: team.color }}
        onClick={async () => {
          await occupyBaseMutation.mutateAsync({ gameToken, userToken, teamNumber: team.id });
          onChange();
        }}
      >
        Select <span className="ml-2">{team.name}</span>
      </button>
    </li>
  );
}

export function OccupationDisplay({ team }: { team: Team | null }) {
  return (
    <>
      {team == null && <div className="my-4 rounded bg-gray-200 px-4 py-2">No occupation</div>}
      {team != null && (
        <div className="my-4 rounded px-4 py-2 text-white" style={{ backgroundColor: team.color }}>
          {team.name}
        </div>
      )}
    </>
  );
}

type Override<T, TKey extends keyof T, TValue> = {
  [k in keyof T]: k extends TKey ? TValue : T[k];
};
