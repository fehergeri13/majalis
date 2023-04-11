import { NextApiRequest } from "next";

export type StrictNextApiRequest<TRequestBody = unknown> = Omit<
  NextApiRequest,
  "body"
> & { body: TRequestBody };