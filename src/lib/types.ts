export interface Client {
  id: number;
  clientName: string;
  clientType: "Individual" | "Company";
  email: string;
  status: "Active" | "Pending";
  createdAt: string; // Use ISO string (e.g., "2023-10-26T10:00:00Z") for easy sorting
  updatedAt: string;
}

export interface SortCriterion {
  key: keyof Client;
  direction: "asc" | "desc";
}
