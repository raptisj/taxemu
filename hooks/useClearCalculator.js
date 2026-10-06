import { useCallback } from "react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { removeComparisonParams } from "utils/yearComparison";

export const useClearCalculator = () => {
  const router = useRouter();
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  return useCallback(() => {
    removeUserDetails();
    router.replace(
      {
        pathname: router.pathname,
        query: removeComparisonParams(router.query),
      },
      undefined,
      { shallow: true },
    );
  }, [removeUserDetails, router]);
};
