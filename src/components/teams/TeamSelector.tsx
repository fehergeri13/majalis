import { api } from "~/utils/api";
import { TeamSelectorItem } from "~/components/teams/TeamSelectorItem";
import { type TeamOrEmpty } from "~/components/teams/TeamOrEmpty";
import { OccupationDisplay } from "~/components/teams/OccupationDisplay";

export function TeamSelector({ userToken, onChange }: { userToken: string; onChange: () => void }) {
  const allTeamQuery = api.example.getAllTeam.useQuery({ userToken });
  const getOccupationQuery = api.example.getOccupation.useQuery({ userToken });

  const teams: TeamOrEmpty[] = allTeamQuery.isSuccess
    ? [...allTeamQuery.data, { name: "Nincs elfoglalva", id: null, color: "#ddd" }]
    : [];

  return (
    <>
      <div className="flex items-center gap-4">
        <h3 className="text-xl">Jelenlegi állapot</h3>
        {getOccupationQuery.isSuccess && <OccupationDisplay team={getOccupationQuery.data} />}
      </div>

      <div className="grow" />

      <div>
        <h3 className="my-4 text-xl">Csapatok</h3>

        <ul className="flex flex-col gap-2">
          {teams.map((team) => (
            <TeamSelectorItem
              key={team.id}
              team={team}
              onChange={async () => {
                await getOccupationQuery.refetch();
                onChange()
              }}
              userToken={userToken}
            />
          ))}
        </ul>
      </div>
    </>
  );
}
