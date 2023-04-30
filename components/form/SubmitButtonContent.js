import { useStore } from "store";

export const SubmitButtonContent = () => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const { dirtyFormState } = userDetails;
  const hasFormChanged = dirtyFormState.length;
  return (
    <>
      Υπολόγισε
      {!!hasFormChanged && (
        <span style={{ marginLeft: "4px" }}>
          {" "}
          {`(${hasFormChanged} ${hasFormChanged > 1 ? "αλλαγές" : "αλλαγή"})`}
        </span>
      )}
    </>
  );
};