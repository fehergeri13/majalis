import { api } from "~/utils/api";
import { usePusherChannel, usePusherPresenceState } from "~/utils/pusher";
import type Pusher from "pusher-js";
import { generateRandomToken } from "~/utils/generateRandomToken";
import { BaseAdminItem } from "~/components/users/BaseAdminItem";

export function BaseAdmin({ gameToken, pusher }: { gameToken: string; pusher: Pusher | null }) {
  const allUserQuery = api.example.getAllUser.useQuery({ gameToken });
  const addUserMutation = api.example.addUserToken.useMutation();

  const presenceChannel = usePusherChannel(pusher, "presence-majalis")
  const memberStore = usePusherPresenceState(presenceChannel);

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {allUserQuery.data?.length === 0 && <>Nincs még bázis hozzáadva</>}
        {allUserQuery.data?.map((user) => (
          <BaseAdminItem
            user={user}
            key={user.id}
            memberStore={memberStore}
            onChange={allUserQuery.refetch}
            pusher={pusher}
          />
        ))}
      </ul>

      <button
        className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
        onClick={async () => {
          await addUserMutation.mutateAsync({ gameToken, userToken: generateRandomToken() });
          await allUserQuery.refetch();
        }}
      >
        Bázis hozzáadása
      </button>
    </div>
  );
}
