"use client";

import { useState, useMemo, useEffect } from "react";
import { ClientTable } from "@/components/ClientTable";
import { Client, SortCriterion } from "@/lib/types";
import { SortControl } from "@/components/SortControl";

const MOCK_CLIENTS: Client[] = [
  {
    id: 20,
    clientName: "Hema",
    clientType: "Individual",
    email: "hema@email.com",
    status: "Active",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-08-20T12:30:00Z",
  },
  {
    id: 21,
    clientName: "Rekha",
    clientType: "Individual",
    email: "rekha@test.com",
    status: "Pending",
    createdAt: "2022-11-20T15:00:00Z",
    updatedAt: "2023-05-10T11:00:00Z",
  },
  {
    id: 22,
    clientName: "Jaya",
    clientType: "Company",
    email: "jaya@corp.com",
    status: "Active",
    createdAt: "2023-01-15T09:00:00Z",
    updatedAt: "2023-09-01T14:00:00Z",
  },
  {
    id: 23,
    clientName: "Sushma",
    clientType: "Company",
    email: "sushma@work.net",
    status: "Pending",
    createdAt: "2024-03-10T18:00:00Z",
    updatedAt: "2024-03-10T18:00:00Z",
  },
];

const DEFAULT_SORT: SortCriterion[] = [{ key: "createdAt", direction: "desc" }];

export default function Home() {
  const [sortCriteria, setSortCriteria] =
    useState<SortCriterion[]>(DEFAULT_SORT);

  useEffect(() => {
    const savedSort = window.localStorage.getItem("clientSortCriteria");
    if (savedSort) {
      return setSortCriteria(JSON.parse(savedSort));
    }
  }, []);

  useEffect(() => {
    // Save the current sort criteria to localStorage as a string
    window.localStorage.setItem(
      "clientSortCriteria",
      JSON.stringify(sortCriteria)
    );
  }, [sortCriteria]);

  const sortedClients = useMemo(() => {
    const sorted = [...MOCK_CLIENTS].sort((a, b) => {
      for (const criterion of sortCriteria) {
        const { key, direction } = criterion;
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;

        if (typeof valA === "string" && typeof valB === "string") {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === "number" && typeof valB === "number") {
          comparison = valA - valB;
        }

        if (comparison !== 0) {
          return direction === "asc" ? comparison : -comparison;
        }
      }
      return 0;
    });
    return sorted;
  }, [sortCriteria]);

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <SortControl criteria={sortCriteria} setCriteria={setSortCriteria} />
      </div>
      <ClientTable clients={sortedClients} />
    </main>
  );
}
