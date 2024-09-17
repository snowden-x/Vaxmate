"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getAllChildren, getSchedule, getAllSchedules } from '@/lib/db';
import AddChildDialog from '@/components/AddChildDialog';
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
  const [children, setChildren] = useState<Child[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const allChildren = await getAllChildren();
    const allSchedules = await getAllSchedules();
    setChildren(allChildren);
    setSchedules(allSchedules);
  }

  const refreshData = () => {
    loadData();
  };

  return (
    <div className="p-4">
      <ChildrenList children={children} schedules={schedules} refreshData={refreshData} />
    </div>
  );
}