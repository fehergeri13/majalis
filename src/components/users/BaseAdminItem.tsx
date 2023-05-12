import { type User } from "@prisma/client";
import { type MemberStore } from "~/utils/pusher";
import { api } from "~/utils/api";
import { HiddenQrCode } from "~/components/HiddenQrCode";
import { getOrigin } from "~/utils/getOrigin";
import Link from "next/link";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { OccupationDisplay } from "~/components/teams/OccupationDisplay";
import { ConnectionDot } from "~/components/ConnectionDot";
import { useState } from "react";

export function BaseAdminItem({ user, memberStore, onChange }: { user: User, memberStore: MemberStore, onChange: () => void }) {
  const [name, setName] = useState(user.userName)

  const getOccupationQuery = api.example.getOccupation.useQuery({
    gameToken: user.gameToken,
    userToken: user.userToken
  });

  const deleteUserMutation = api.example.deleteUser.useMutation();
  const saveUserNameMutation = api.example.saveUserName.useMutation();

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

      <input className="px-2 py-1 rounded" value={name} onChange={(e) => setName(e.target.value)} />

      {name !== user.userName && <>
        <button
          className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
          onClick={async () => {
          await saveUserNameMutation.mutateAsync({gameToken: user.gameToken, userToken: user.userToken, userName: name})
          onChange()
        }}>Mentés</button>
        <button
          className="rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
          onClick={() => setName(user.userName)}>Visszaállít</button>
      </>}

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