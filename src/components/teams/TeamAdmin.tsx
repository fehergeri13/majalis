import { api } from "~/utils/api";
import { TeamRow } from "~/components/teams/TeamRow";

export function TeamAdmin({ gameToken }: { gameToken: string }) {
  const allTeamQuery = api.example.getAllTeam.useQuery({ gameToken });
  const addTeamMutation = api.example.addTeam.useMutation();

  return (
    <div className="p-2 border border-gray-400 rounded">
      <h2 className="text-xl mb-4">Csapatok:</h2>

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
        Csapat hozzáadása
      </button>
    </div>
  );
}

