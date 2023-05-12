import { api } from "~/utils/api";

export function StartStopGame({ gameToken }: { gameToken: string }) {
  const startGameMutation = api.example.startGame.useMutation();
  const resetGameMutation = api.example.resetGame.useMutation();
  const finalizeGameMutation = api.example.finalizeGame.useMutation();
  const pauseGameMutation = api.example.pauseGame.useMutation();
  const resumeGameMutation = api.example.resumeGame.useMutation();

  const scoreInputQuery = api.example.getScoreInput.useQuery({ gameToken });

  const getGameQuery = api.example.getGame.useQuery({ gameToken });

  return (
    <>
      {getGameQuery.isSuccess && (
        <div>
          <h2 className="flex items-center gap-2 text-xl">
            Játék állapota:
            {getGameQuery.data.status === "new" && <div className="rounded bg-yellow-500 px-2 py-1">Előkészítés alatt</div>}
            {getGameQuery.data.status === "started" && <div className="rounded bg-green-500 px-2 py-1">Folyamatban</div>}
            {getGameQuery.data.status === "paused" && <div className="rounded bg-gray-400 px-2 py-1">Szüneteltetve</div>}
            {getGameQuery.data.status === "finished" && <div className="rounded bg-purple-500 px-2 py-1">Véglegesítve</div>}
          </h2>
          <div className="flex items-center">
            {getGameQuery.data.status === "new" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await startGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                  await scoreInputQuery.refetch();
                }}
              >
                Indítás
              </button>
            )}

            {getGameQuery.data.status === "started" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await pauseGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                  await scoreInputQuery.refetch();
                }}
              >
                Szünet
              </button>
            )}

            {getGameQuery.data.status === "paused" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  if (confirm("Újra szeretnéd indítani a játékot? Az összes eddigi pontszám törlődik!")) {
                    await resetGameMutation.mutateAsync({ gameToken });
                    await getGameQuery.refetch();
                    await scoreInputQuery.refetch();
                  }
                }}
              >
                Újraindítás
              </button>
            )}

            {getGameQuery.data.status === "paused" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await resumeGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                  await scoreInputQuery.refetch();
                }}
              >
                Folytatás
              </button>
            )}

            {getGameQuery.data.status === "paused" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  if (confirm("Le akarod zárni a játékot? Utána többet már nem lehet elindítani!")) {
                    await finalizeGameMutation.mutateAsync({ gameToken });
                    await getGameQuery.refetch();
                    await scoreInputQuery.refetch();
                  }
                }}
              >
                Lezárás
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}