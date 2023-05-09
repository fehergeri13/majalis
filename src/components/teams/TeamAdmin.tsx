import { api } from "~/utils/api";
import { type Team } from "@prisma/client";
import { useState } from "react";

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

export function TeamRow({ team, onChange }: { team: Team; onChange: () => void }) {
  const [name, setName] = useState(team.name);
  const [color, setColor] = useState(team.color);
  const updateTeamMutation = api.example.updateTeam.useMutation();

  return (
    <li className="flex items-center gap-2">
      <input type="text" className="px-2 py-1 border border-gray-200 rounded " value={name} onChange={(e) => setName(e.target.value)} />
      <input type="color" className="px-0 py-0 border border-gray-200 rounded " value={color} onChange={(e) => setColor(e.target.value)} />

      {(name !== team.name || color !== team.color) && (
        <>
          <button
            className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
            onClick={async () => {
              await updateTeamMutation.mutateAsync({ ...team, name, color });
              onChange();
            }}
          >
            Update team
          </button>
          <button
            className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
            onClick={() => {
              setName(team.name)
              setColor(team.color)
            }}
          >
            Undo changes
          </button>
        </>
      )}
    </li>
  );
}
