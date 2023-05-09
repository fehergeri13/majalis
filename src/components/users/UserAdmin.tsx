import { ConnectionDot } from "~/components/ConnectionDot";
import { HiddenQrCode } from "~/components/HiddenQrCode";
import { generateRandomToken, getOrigin } from "~/pages/admin";
import Link from "next/link";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { api } from "~/utils/api";
import { MemberStore, usePusherPresenceChannelStore } from "~/utils/pusher";
import type Pusher from "pusher-js";
import { type User } from "@prisma/client";
import { OccupationDisplay } from "~/components/teams/TeamSelector";

export function UserAdmin({ gameToken, pusher }: { gameToken: string; pusher: Pusher | null }) {
  const allUserQuery = api.example.getAllUser.useQuery({ gameToken });
  const addUserMutation = api.example.addUserToken.useMutation();
  const memberStore = usePusherPresenceChannelStore(pusher, "presence-majalis");

  return (
    <>
      <ul className="space-y-4">
        {allUserQuery.data?.length === 0 && <>No user created yet</>}
        {allUserQuery.data?.map((user) => (
          <UserAdminItem user={user} key={user.id} memberStore={memberStore} onChange={allUserQuery.refetch} />
        ))}
      </ul>

      <button
        className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
        onClick={async () => {
          await addUserMutation.mutateAsync({ gameToken, userToken: generateRandomToken() });
          await allUserQuery.refetch();
        }}
      >
        Generate user QR code
      </button>
    </>
  );
}

export function UserAdminItem({ user, memberStore, onChange }: { user: User, memberStore: MemberStore, onChange: () => void }) {
  const getOccupationQuery = api.example.getOccupation.useQuery({
    gameToken: user.gameToken,
    userToken: user.userToken,
  });

  const deleteUserMutation = api.example.deleteUser.useMutation()

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
        if(confirm(`Do you want to delete user:${user.userName}`)) {
          await deleteUserMutation.mutateAsync({userToken: user.userToken})
          onChange()
        }
      }}><IconTrash className="w-5 h-5"/></button>
    </li>
  );
}
