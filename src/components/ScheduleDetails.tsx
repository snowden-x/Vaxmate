'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getSchedule, updateSchedule } from '@/lib/db'
import { Calendar03Icon } from 'hugeicons-react'
import { ScrollArea } from './ui/scroll-area'

import ExportButton from './ExportButton'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

type Visit = {
    visitNumber: number
    date: string
    vaccines: string[]
}

type ScheduleDetailsProps = {
    childId: string
    childName: string
    dateOfBirth: string
    refreshData: () => void
}

export function ScheduleDetails({ childId, childName, refreshData}: ScheduleDetailsProps) {
    const [schedule, setSchedule] = useState<Visit[]>([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const fetchSchedule = async () => {
            const fetchedSchedule = await getSchedule(childId)
            if (fetchedSchedule) {
                setSchedule(fetchedSchedule.visits)
            }
        }
        if (open) {
            fetchSchedule()
        }
    }, [childId, open])

    const handleVaccineToggle = async (visitNumber: number, vaccine: string) => {
        const updatedSchedule = schedule.map(visit => {
            if (visit.visitNumber === visitNumber) {
                return {
                    ...visit,
                    vaccines: visit.vaccines.map(v =>
                        v === vaccine ? (v.startsWith('✓ ') ? v.slice(2) : `✓ ${v}`) : v
                    )
                }
            }
            return visit
        })
        setSchedule(updatedSchedule)
        await updateSchedule(childId, updatedSchedule)
        refreshData()
    }

    const handleVisitCompletion = async (visitNumber: number) => {
        const updatedSchedule = schedule.map(visit => {
            if (visit.visitNumber === visitNumber) {
                return {
                    ...visit,
                    vaccines: visit.vaccines.map(v => v.startsWith('✓ ') ? v : `✓ ${v}`)
                }
            }
            return visit
        })
        setSchedule(updatedSchedule)
        await updateSchedule(childId, updatedSchedule)
        refreshData()
    }

    const getVisitStatus = (visit: Visit) => {
        const completedVaccines = visit.vaccines.filter(v => v.startsWith('✓ ')).length
        return completedVaccines === visit.vaccines.length ? 'Completed' :
            completedVaccines > 0 ? 'Partially Completed' : 'Pending'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-500'
            case 'Partially Completed': return 'text-yellow-500'
            default: return 'text-red-500'
        }
    }

    const getImmunizationTiming = (visitNumber: number) => {
        switch (visitNumber) {
            case 1: return 'At Birth';
            case 2: return 'At 6 Weeks';
            case 3: return 'At 10 Weeks';
            case 4: return 'At 14 Weeks';
            case 5: return 'At 9 Months';
            case 6: return 'At 18 Months';
            default: return `Visit ${visitNumber}`;
        }
    }

    const handleExport = (format: 'pdf' | 'excel') => {
        if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text(`${childName}'s Vaccination Schedule`, 14, 10);
            //@ts-expect-error: jsPDF types are not fully compatible with autoTable
            doc.autoTable({
                head: [['Visit', 'Date', 'Vaccines', 'Status']],

                body: schedule.map(visit => [
                    getImmunizationTiming(visit.visitNumber),
                    new Date(visit.date).toLocaleDateString(),
                    visit.vaccines.join(', '),
                    getVisitStatus(visit)
                ]),
            });
            doc.save(`${childName}_vaccination_schedule.pdf`);
        } else if (format === 'excel') {
            const ws = XLSX.utils.aoa_to_sheet([
                ['Visit', 'Date', 'Vaccines', 'Status'],
                ...schedule.map(visit => [
                    getImmunizationTiming(visit.visitNumber),
                    new Date(visit.date).toLocaleDateString(),
                    visit.vaccines.join(', '),
                    getVisitStatus(visit)
                ])
            ]);
            ws['!cols'] = [
                { wch: 15 },  // Visit
                { wch: 12 },  // Date
                { wch: 52 },  // Vaccines
                { wch: 20 }   // Status
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
            XLSX.writeFile(wb, `${childName}_vaccination_schedule.xlsx`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="" size="sm">View Schedule</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] bg-white overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle><span className='capitalize'>{childName}</span>&apos;s Vaccination Schedule</DialogTitle>
                        <ExportButton onExport={handleExport} />
                    </div>
                </DialogHeader>
                <ScrollArea>
                    <div className="grid gap-4 py-4">
                        {schedule.map((visit) => (
                            <Card key={visit.visitNumber} className="shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Immunization {getImmunizationTiming(visit.visitNumber)}
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Calendar03Icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(visit.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-sm font-semibold ${getStatusColor(getVisitStatus(visit))}`}>
                                            {getVisitStatus(visit)}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleVisitCompletion(visit.visitNumber)}
                                        >
                                            Mark All Complete
                                        </Button>
                                    </div>
                                    <ul className="space-y-1">
                                        {visit.vaccines.map((vaccine) => (
                                            <li key={vaccine} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${visit.visitNumber}-${vaccine}`}
                                                    checked={vaccine.startsWith('✓ ')}
                                                    onCheckedChange={() => handleVaccineToggle(visit.visitNumber, vaccine)}
                                                />
                                                <label
                                                    htmlFor={`${visit.visitNumber}-${vaccine}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {vaccine.startsWith('✓ ') ? vaccine.slice(2) : vaccine}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                </ScrollArea>

            </DialogContent>
        </Dialog>
    )
}