import { type Team } from "@prisma/client";
import { type Override } from "~/components/teams/Override";


export type TeamOrEmpty = Omit<Override<Team, "id", number | null>, "gameToken">;