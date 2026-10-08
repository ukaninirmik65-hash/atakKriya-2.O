import { useMemo } from "react";
import { calculateWorkingHours } from "../data/salesTracking";

const useSalesDailyAttendance = (salesPerson, date) =>
  useMemo(() => {
    const attendance = salesPerson?.days[date]?.attendance;
    if (!attendance) return null;

    return {
      ...attendance,
      workingMinutes: calculateWorkingHours(
        attendance.checkIn,
        attendance.checkOut,
      ),
    };
  }, [date, salesPerson]);

export default useSalesDailyAttendance;
