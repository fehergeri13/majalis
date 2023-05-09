import { api } from "~/utils/api";

export function SimpleScore({gameToken}:{gameToken: string}) {
  const scoreQuery = api.example.getAllScore.useQuery({ gameToken }, {refetchInterval: 100_000});

  return <>
    {scoreQuery.isSuccess && <>

      <ul>{scoreQuery.data.map(item => {
        return <li className="flex items-center gap-2">
          <div>team: {item.team.name}</div>
          <div>score: {item.score}</div>
        </li>;
      })}</ul>
    </>}
  </>
}