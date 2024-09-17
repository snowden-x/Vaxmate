"use client"
import React, { useState, useEffect } from 'react';
import { getAllChildren, getAllSchedules } from '@/lib/db';
import ChildrenList from './ChildrenList';

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
}

interface Schedule {
  childId: string;
  visits: Array<{
    visitNumber: number;
    date: string;
    vaccines: string[];
  }>;
}

export default function VaccineScheduler() {
  const [patients, setPatients] = useState<Child[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const allPatients = await getAllChildren();
    const allSchedules = await getAllSchedules();
    setPatients(allPatients);
    setSchedules(allSchedules);
  }

  const refreshData = () => {
    loadData();
  };

  return (
    <div className="p-4">
      <ChildrenList
        patients={patients}
        schedules={schedules}
        refreshData={refreshData}
      />
    </div>
  );
}