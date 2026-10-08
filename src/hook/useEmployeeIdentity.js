import useAuth from "./useAuth";

const useEmployeeIdentity = () => {
  const { user, loading } = useAuth();
  const employeeKey =
    user?.employeeId ?? user?.email ?? user?.id ?? null;

  return {
    loading,
    employeeKey: employeeKey == null ? null : String(employeeKey),
    employeeName: user?.name || user?.email || "Employee",
    displayEmployeeId: String(user?.employeeId ?? user?.id ?? "—"),
  };
};

export default useEmployeeIdentity;
