import { useStore } from "store";
import { getCalculationDirtyFields } from "utils";

export const SubmitButtonContent = ({ entity }) => {
  const details = useStore((state) => state.userDetails[entity]);
  const dirtyFieldCount = getCalculationDirtyFields(entity, details).length;

  return (
    <>
      Υπολόγισε
      {!!dirtyFieldCount && (
        <span style={{ marginLeft: "4px" }}>
          {" "}
          {`(${dirtyFieldCount} ${dirtyFieldCount > 1 ? "αλλαγές" : "αλλαγή"})`}
        </span>
      )}
    </>
  );
};
