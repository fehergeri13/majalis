import { api } from "~/utils/api";
import { TeamSelectorItem } from "~/components/teams/TeamSelectorItem";
import { type TeamOrEmpty } from "~/components/teams/TeamOrEmpty";
import { OccupationDisplay } from "~/components/teams/OccupationDisplay";

export function TeamSelector({ userToken }: { userToken: string }) {
  const allTeamQuery = api.example.getAllTeam.useQuery({ userToken });
  const getOccupationQuery = api.example.getOccupation.useQuery({ userToken });

  const teams: TeamOrEmpty[] = allTeamQuery.isSuccess
    ? [...allTeamQuery.data, { name: "Nincs elfoglalva", id: null, color: "#ddd" }]
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
              userToken={userToken}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

