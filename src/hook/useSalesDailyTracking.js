import { useMemo } from "react";
import { calculateRouteDistance, calculateWorkingHours } from "../data/salesTracking";

const useSalesDailyTracking = (salesPerson, date) =>
  useMemo(() => {
    const day = salesPerson?.days[date];
    if (!day) return null;

    const points = [...day.points].sort(
      (first, second) => new Date(first.time) - new Date(second.time),
    );
    const startPoint = points[0] || null;
    const endPoint = points[points.length - 1] || null;

    return {
      date: day.date,
      attendance: day.attendance,
      points,
      startPoint,
      endPoint,
      currentPoint: endPoint,
      distanceKm: calculateRouteDistance(points),
      routeMinutes: calculateWorkingHours(
        day.attendance?.checkIn,
        day.attendance?.checkOut,
      ),
    };
  }, [date, salesPerson]);

export default useSalesDailyTracking;
