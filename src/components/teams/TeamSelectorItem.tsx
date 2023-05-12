import { api } from "~/utils/api";
import { type TeamOrEmpty } from "~/components/teams/TeamOrEmpty";

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
