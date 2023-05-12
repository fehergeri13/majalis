import { useRouter } from "next/router";
import { useEffect } from "react";
import { useRefProxy } from "~/utils/useRefProxy";
import { generateRandomToken } from "~/utils/generateRandomToken";

export function useGeneratedToken(
  queryKey: string,
  mutate?: (token: string, onSuccess: () => void) => void,
  enabled = true
): string | undefined {
  const router = useRouter();
  const mutateRef = useRefProxy(mutate);

  useEffect(() => {
    if (!enabled) return;
    if (!router.isReady) return;

    if (router.query.gameToken == null || router.query.gameToken == "") {
      const newToken = generateRandomToken();
      router.query[queryKey] = newToken;

      if (mutateRef.current != null) {
        mutateRef.current(newToken, () => {
          router
            .replace({
              query: { ...router.query, [queryKey]: newToken }
            })
            .then(Boolean)
            .catch(Boolean);
        });
      } else {
        router
          .replace({ query: { ...router.query, [queryKey]: newToken } })
          .then(Boolean)
          .catch(Boolean);
      }
    }
  }, [enabled, mutateRef, router, queryKey]);

  return router.query[queryKey] as string | undefined;
}