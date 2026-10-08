import { useEffect, useMemo, useState } from "react";
import {
  calculateEmployeeMinutes,
  getLocalDateKey,
  loadEmployeeAttendanceRecords,
  markEmployeeCheckedIn,
  markEmployeeCheckedOut,
  saveEmployeeAttendanceRecords,
} from "../data/employeeAttendance";
import {
  loadEmployeeLeaveRequests,
} from "../data/employeeLeaveRequests";
import { loadSalesExpenses } from "../data/salesExpenses";
import {
  loadSalesActivityDescriptions,
  salesPeople,
} from "../data/salesTracking";
import useEmployeeIdentity from "./useEmployeeIdentity";
import useAuth from "./useAuth";
import useSalesDailyTracking from "./useSalesDailyTracking";
import useToast from "./useToast";

const EMPTY_ARRAY = [];

const findOwnSalesPerson = (user) => {
  const candidateIds = [
    user?.salesPersonId,
    user?.salespersonId,
    user?.employeeId,
    user?.id,
  ]
    .filter((value) => value !== null && value !== undefined)
    .map(String);

  return (
    salesPeople.find((person) => candidateIds.includes(String(person.id))) ??
    null
  );
};

const useEmployeeDashboardData = () => {
  const { employeeKey, employeeName, displayEmployeeId, loading: authLoading } =
    useEmployeeIdentity();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [dataState, setDataState] = useState(null);
  const [salesActivityState, setSalesActivityState] = useState(null);
  const now = new Date();
  const currentDateKey = getLocalDateKey(now);
  const currentMonthKey = currentDateKey.slice(0, 7);
  const salesPerson = findOwnSalesPerson(user);
  const salesTracking = useSalesDailyTracking(salesPerson, currentDateKey);
  const salesActivityKey = salesPerson
    ? `${salesPerson.id}:${currentDateKey}`
    : "";

  useEffect(() => {
    if (authLoading) return undefined;
    let active = true;

    Promise.resolve().then(() => {
      const nextState = {
        employeeKey,
        attendance: EMPTY_ARRAY,
        leaveRequests: EMPTY_ARRAY,
        expenses: EMPTY_ARRAY,
        errors: {},
      };

      if (!employeeKey) {
        nextState.errors.identity =
          "Your employee account could not be identified.";
        if (active) setDataState(nextState);
        return;
      }

      try {
        nextState.attendance = loadEmployeeAttendanceRecords(employeeKey);
      } catch (error) {
        nextState.errors.attendance =
          error instanceof Error
            ? error.message
            : "Attendance records could not be loaded.";
      }

      try {
        nextState.leaveRequests = loadEmployeeLeaveRequests(employeeKey);
      } catch (error) {
        nextState.errors.leave =
          error instanceof Error
            ? error.message
            : "Leave requests could not be loaded.";
      }

      try {
        nextState.expenses = loadSalesExpenses(employeeKey);
      } catch (error) {
        nextState.errors.expenses =
          error instanceof Error
            ? error.message
            : "Expense records could not be loaded.";
      }

      if (active) setDataState(nextState);
    });

    return () => {
      active = false;
    };
  }, [authLoading, employeeKey]);

  useEffect(() => {
    if (!salesActivityKey || !salesPerson) return undefined;

    let active = true;
    Promise.resolve().then(() => {
      try {
        const descriptions = loadSalesActivityDescriptions(
          salesPerson.id,
          currentDateKey,
        );
        if (active) {
          setSalesActivityState({
            key: salesActivityKey,
            descriptions,
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setSalesActivityState({
            key: salesActivityKey,
            descriptions: EMPTY_ARRAY,
            error:
              error instanceof Error
                ? error.message
                : "Sales activity descriptions could not be loaded.",
          });
        }
      }
    });

    return () => {
      active = false;
    };
  }, [currentDateKey, salesActivityKey, salesPerson]);

  const records =
    dataState?.employeeKey === employeeKey
      ? dataState.attendance
      : EMPTY_ARRAY;
  const leaveRequests =
    dataState?.employeeKey === employeeKey
      ? dataState.leaveRequests
      : EMPTY_ARRAY;
  const expenses =
    dataState?.employeeKey === employeeKey
      ? dataState.expenses
      : EMPTY_ARRAY;
  const errors =
    dataState?.employeeKey === employeeKey ? dataState.errors : {};
  const todayRecord = records.find((record) => record.date === currentDateKey);
  const todayMinutes = calculateEmployeeMinutes(todayRecord, now.getTime());
  const monthRecords = useMemo(
    () => records.filter((record) => record.date.startsWith(currentMonthKey)),
    [currentMonthKey, records],
  );
  const monthlySummary = useMemo(
    () => ({
      present: monthRecords.filter((record) => record.status === "present").length,
      absent: monthRecords.filter((record) => record.status === "absent").length,
      leave: monthRecords.filter((record) => record.status === "leave").length,
      late: monthRecords.filter((record) => record.late).length,
      workingMinutes: monthRecords.reduce(
        (total, record) =>
          total +
          (record.date === currentDateKey && !record.checkOut
            ? todayMinutes
            : record.workingMinutes || 0),
        0,
      ),
      overtimeMinutes: monthRecords.reduce(
        (total, record) => total + (record.overtimeMinutes || 0),
        0,
      ),
    }),
    [currentDateKey, monthRecords, todayMinutes],
  );
  const leaveSummary = useMemo(
    () => ({
      pending: leaveRequests.filter((request) => request.status === "Pending"),
      approved: leaveRequests.filter((request) => request.status === "Approved"),
      rejected: leaveRequests.filter((request) => request.status === "Rejected"),
      recent: [...leaveRequests]
        .sort(
          (first, second) =>
            new Date(second.submittedAt) - new Date(first.submittedAt),
        )
        .slice(0, 3),
    }),
    [leaveRequests],
  );
  const salesActivity =
    salesActivityState?.key === salesActivityKey
      ? salesActivityState.descriptions
      : EMPTY_ARRAY;
  const todayExpenses = useMemo(
    () => expenses.filter((expense) => expense.date === currentDateKey),
    [currentDateKey, expenses],
  );
  const checkIn = () => {
    if (!employeeKey || todayRecord?.checkIn) return false;
    const timestamp = new Date();
    const nextRecords = markEmployeeCheckedIn(records, employeeKey, timestamp);
    try {
      saveEmployeeAttendanceRecords(employeeKey, nextRecords);
      setDataState((current) =>
        current?.employeeKey === employeeKey
          ? { ...current, attendance: nextRecords }
          : current,
      );
      showToast("Attendance marked successfully", { type: "success" });
      return true;
    } catch {
      showToast("Attendance could not be saved. Please try again.", {
        type: "error",
      });
      return false;
    }
  };
  const checkOut = () => {
    if (!employeeKey || !todayRecord?.checkIn || todayRecord.checkOut) {
      return false;
    }
    const nextRecords = markEmployeeCheckedOut(records, new Date());
    if (!nextRecords) return false;
    try {
      saveEmployeeAttendanceRecords(employeeKey, nextRecords);
      setDataState((current) =>
        current?.employeeKey === employeeKey
          ? { ...current, attendance: nextRecords }
          : current,
      );
      showToast("Attendance marked successfully", { type: "success" });
      return true;
    } catch {
      showToast("Attendance could not be saved. Please try again.", {
        type: "error",
      });
      return false;
    }
  };

  return {
    employeeKey,
    employeeName,
    displayEmployeeId,
    loading: authLoading || dataState?.employeeKey !== employeeKey,
    errors,
    todayKey: currentDateKey,
    todayRecord,
    todayMinutes,
    monthlySummary,
    leaveSummary,
    expenses,
    todayExpenses,
    salesPerson,
    salesTracking,
    salesActivity,
    salesActivityError:
      salesActivityState?.key === salesActivityKey
        ? salesActivityState.error
        : "",
    salesActivityLoading: Boolean(
      salesPerson && salesActivityState?.key !== salesActivityKey,
    ),
    checkIn,
    checkOut,
  };
};

export default useEmployeeDashboardData;
