import { useStore } from "store";

export const SubmitButtonContent = () => {
  const userEmployeeDetails = useStore((state) => state.userDetails.employee);
  const userBusinessDetails = useStore((state) => state.userDetails.business);

  const hasFormChanged =
    userEmployeeDetails.dirtyFormState.length ||
    userBusinessDetails.dirtyFormState.length;
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
