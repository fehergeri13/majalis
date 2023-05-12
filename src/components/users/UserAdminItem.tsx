import { type User } from "@prisma/client";
import { type MemberStore } from "~/utils/pusher";
import { api } from "~/utils/api";
import { HiddenQrCode } from "~/components/HiddenQrCode";
import { getOrigin } from "~/utils/getOrigin";
import Link from "next/link";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { ConnectionDot } from "~/components/ConnectionDot";
import { OccupationDisplay } from "~/components/teams/OccupationDisplay";

export function UserAdminItem({ user, memberStore, onChange }: { user: User, memberStore: MemberStore, onChange: () => void }) {
  const getOccupationQuery = api.example.getOccupation.useQuery({
    gameToken: user.gameToken,
    userToken: user.userToken
  });

  const deleteUserMutation = api.example.deleteUser.useMutation();

  return (
    <li key={user.id} className="flex items-center space-x-4 rounded border border-gray-300 p-2">
      <HiddenQrCode
        data={`${getOrigin()}/game/${user.gameToken}/${user.userToken}`}
        width={200}
        height={200}
      />
      <Link href={`/game/${user.gameToken}/${user.userToken}`} target="_blank">
        Open user
        <IconExternalLink className="ml-2 inline-block h-5 w-5 text-gray-600" />
      </Link>

      <div className="w-[200px] pl-8">{user.userName !== "" ? user.userName : "No-name"}</div>

      <ConnectionDot isConnected={memberStore.isConnected(user.userToken)} />

      {getOccupationQuery.isSuccess && <OccupationDisplay team={getOccupationQuery.data} />}

      <div className="grow"></div>

      <button className="rounded border border-gray-200 bg-red-500 px-2 py-1 text-white hover:bg-red-600 active:bg-red-700" onClick={async () => {
        if (confirm(`Do you want to delete user:${user.userName}`)) {
          await deleteUserMutation.mutateAsync({ userToken: user.userToken });
          onChange();
        }
      }}><IconTrash className="w-5 h-5" /></button>
    </li>
  );
}