import { type Team } from "@prisma/client";

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