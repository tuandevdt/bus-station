// src/types/assignment.ts
export interface TripRecord {
  id: string;
  startPoint: string;
  endPoint: string;
  startTime: string; // "06:30 PM"
  endTime: string;
  date: string; // "30/05/2025"
  vehicle?: string;
  status: "pending" | "assigned" | "completed" | "cancelled";
}

export interface AssignmentRecord {
  id: string;
  tripId: string;
  driverId: string;
  driverName: string;
  vehicle?: string;
  assignedAt: string; // "30/05/2025"
  status: "assigned" | "completed" | "cancelled";
  trip?: TripRecord;
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    rating: number;
  };
}