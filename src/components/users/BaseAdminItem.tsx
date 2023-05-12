import { type User } from "@prisma/client";
import { type MemberStore } from "~/utils/pusher";
import { api } from "~/utils/api";
import { HiddenQrCode } from "~/components/HiddenQrCode";
import { getOrigin } from "~/utils/getOrigin";
import Link from "next/link";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { OccupationDisplay } from "~/components/teams/OccupationDisplay";
import { ConnectionDot } from "~/components/ConnectionDot";

export function BaseAdminItem({ user, memberStore, onChange }: { user: User, memberStore: MemberStore, onChange: () => void }) {
  const getOccupationQuery = api.example.getOccupation.useQuery({
    gameToken: user.gameToken,
    userToken: user.userToken
  });

  const deleteUserMutation = api.example.deleteUser.useMutation();

  return (
    <li key={user.id} className="flex items-center gap-4 group hover:bg-blue-100 p-2">
      <HiddenQrCode
        data={`${getOrigin()}/game/${user.gameToken}/${user.userToken}`}
        width={200}
        height={200}
      />
      <Link href={`/game/${user.gameToken}/${user.userToken}`} target="_blank" className="whitespace-nowrap">
        Bázis megnyitása
        <IconExternalLink className="ml-2 inline-block h-5 w-5 text-gray-600" />
      </Link>

      <div className="">{user.userName !== "" ? user.userName : "Névtelen"}</div>


      <div className="grow"></div>

      <ConnectionDot isConnected={memberStore.isConnected(user.userToken)} />

      {getOccupationQuery.isSuccess && <OccupationDisplay team={getOccupationQuery.data} />}


      <button className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto  rounded border border-gray-200 bg-red-500 px-2 py-1 text-white hover:bg-red-600 active:bg-red-700" onClick={async () => {
        if (confirm(`Do you want to delete user:${user.userName}`)) {
          await deleteUserMutation.mutateAsync({ userToken: user.userToken });
          onChange();
        }
      }}><IconTrash className="w-5 h-5" /></button>
    </li>
  );
}