import { type Team } from "@prisma/client";

export function OccupationDisplay({ team }: { team: Team | null }) {
  return (
    <>
      {team == null && <div className="rounded bg-gray-200 px-4 py-2 whitespace-nowrap">Nincs elfoglalva</div>}
      {team != null && (
        <div className="rounded px-4 py-2 text-white whitespace-nowrap" style={{ backgroundColor: team.color }}>
          {team.name}
        </div>
      )}
    </>
  );
}