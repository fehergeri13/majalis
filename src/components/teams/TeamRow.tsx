import { type Team } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import { IconTrash } from "@tabler/icons-react";

export function TeamRow({ team, onChange }: { team: Team; onChange: () => void }) {
  const [name, setName] = useState(team.name);
  const [color, setColor] = useState(team.color);
  const updateTeamMutation = api.example.updateTeam.useMutation();
  const deleteTeamMutation = api.example.deleteTeam.useMutation();

  return (
    <li className="flex items-center gap-2 hover:bg-gray-100 py-1 px-1 group">

      <div className="flex items-center border border-gray-200 rounded" style={{backgroundColor: color}}>
      <input type="text" className="px-2 py-1  text-white bg-transparent border-r border-white" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="hover:bg-white/20">
        <input type="color" className="opacity-0 cursor-pointer" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      </div>

      {(name !== team.name || color !== team.color) && (
        <>
          <button
            className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
            onClick={async () => {
              await updateTeamMutation.mutateAsync({ ...team, name, color });
              onChange();
            }}
          >
            Mentés
          </button>
          <button
            className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
            onClick={() => {
              setName(team.name);
              setColor(team.color);
            }}
          >
            Visszaállít
          </button>
        </>
      )}
      <div className="grow" />

      <button className="hidden group-hover:block rounded border border-gray-200 bg-red-500 px-2 py-1 text-white hover:bg-red-600 active:bg-red-700" onClick={async () => {
        if (confirm(`Do you want to delete team:${team.name}`)) {
          await deleteTeamMutation.mutateAsync(team);
          onChange();
        }
      }}><IconTrash className="w-5 h-5" /></button>
    </li>
  );
}