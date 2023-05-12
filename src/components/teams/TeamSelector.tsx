import { api } from "~/utils/api";
import { TeamSelectorItem } from "~/components/teams/TeamSelectorItem";
import { type TeamOrEmpty } from "~/components/teams/TeamOrEmpty";
import { OccupationDisplay } from "~/components/teams/OccupationDisplay";

export function TeamSelector({ gameToken, userToken }: { gameToken: string; userToken: string }) {
  const allTeamQuery = api.example.getAllTeam.useQuery({ gameToken });
  const getOccupationQuery = api.example.getOccupation.useQuery({ gameToken, userToken });

  const teams: TeamOrEmpty[] = allTeamQuery.isSuccess
    ? [...allTeamQuery.data, { gameToken, name: "Nincs elfoglalva", id: null, color: "#ddd" }]
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

