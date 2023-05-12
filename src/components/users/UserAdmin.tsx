import { api } from "~/utils/api";
import { usePusherPresenceChannelStore } from "~/utils/pusher";
import type Pusher from "pusher-js";
import { generateRandomToken } from "~/utils/generateRandomToken";
import { UserAdminItem } from "~/components/users/UserAdminItem";

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

