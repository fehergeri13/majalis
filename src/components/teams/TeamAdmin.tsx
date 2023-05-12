import { api } from "~/utils/api";
import { TeamRow } from "~/components/teams/TeamRow";

export function TeamAdmin({ gameToken }: { gameToken: string }) {
  const allTeamQuery = api.example.getAllTeam.useQuery({ gameToken });
  const addTeamMutation = api.example.addTeam.useMutation();

  return (
    <div className="py-2 border-y border-gray-400 my-8">
      <h3 className="text-xl mb-4">Teams</h3>

      <ul className="flex flex-col gap-2">
        {allTeamQuery.data?.map((team) => (
          <TeamRow key={team.id} team={team} onChange={allTeamQuery.refetch} />
        ))}
      </ul>

      <button
        className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
        onClick={async () => {
          await addTeamMutation.mutateAsync({ gameToken });
          await allTeamQuery.refetch();
        }}
      >
        Add team
      </button>
    </div>
  );
}

