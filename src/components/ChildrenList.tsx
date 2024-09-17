'use client'

import { useState } from 'react'
import { Search01Icon, Calendar03Icon, ArrowLeft01Icon, ArrowRight01Icon, AlertCircleIcon, Tick01Icon, Sorting01Icon, FileEditIcon, UserRemove01Icon, UserAdd01Icon, Cancel01Icon } from 'hugeicons-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScheduleDetails } from './ScheduleDetails'
import EditChildDialog from './EditChildDialog'
import AddChildDialog from './AddChildDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { deleteChild } from '@/lib/db'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import EmptyState from './EmptyState';

type Child = {
    id: string
    name: string
    dateOfBirth: string
}

type Schedule = {
    childId: string
    visits: Array<{
        visitNumber: number
        date: string
        vaccines: string[]
    }>
}

type SortOption = 'name' | 'dob' | 'nextVaccine'

interface ChildrenListProps {
    children: Child[];
    schedules: Schedule[];
    refreshData: () => void;
}

export default function ChildrenList({ children, schedules, refreshData }: ChildrenListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6
    const [editChildDialogOpen, setEditChildDialogOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isAddChildOpen, setIsAddChildOpen] = useState(false);
    const [childToDelete, setChildToDelete] = useState<{ id: string, name: string } | null>(null);
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
    const [toDate, setToDate] = useState<Date | undefined>(undefined)

    const getNextVaccinationDate = (childId: string) => {
        const schedule = schedules.find(s => s.childId === childId)
        if (!schedule) return 'Not scheduled'

        const allCompleted = schedule.visits.every(visit =>
            visit.vaccines.every(vaccine => vaccine.startsWith('✓ '))
        )

        if (allCompleted) {
            return 'Completed'
        }

        const nextVisit = schedule.visits.find(visit =>
            visit.vaccines.some(vaccine => !vaccine.startsWith('✓ '))
        )

        return nextVisit
            ? new Date(nextVisit.date).toLocaleDateString()
            : 'Not scheduled'
    }

    const getCompletedImmunizations = (childId: string) => {
        const schedule = schedules.find(s => s.childId === childId)
        if (!schedule) return 0

        let completed = 0
        let total = 0

        schedule.visits.forEach(visit => {
            total += visit.vaccines.length
            completed += visit.vaccines.filter(vaccine => vaccine.startsWith('✓ ')).length
        })

        return `${completed}/${total}`
    }

    const filterByDateRange = (children: Child[]) => {
        if (!fromDate && !toDate) return children;
        return children.filter(child => {
            const nextVaccination = getNextVaccinationDate(child.id);
            if (nextVaccination === 'Completed' || nextVaccination === 'Not scheduled') return false;
            const vaccinationDate = new Date(nextVaccination);
            if (fromDate && toDate) {
                return vaccinationDate >= fromDate && vaccinationDate <= toDate;
            } else if (fromDate) {
                return vaccinationDate >= fromDate;
            } else if (toDate) {
                return vaccinationDate <= toDate;
            }
            return true;
        });
    };

    const filteredChildren = filterByDateRange(children.filter(child =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    const sortedChildren = [...filteredChildren].sort((a, b) => {
        if (sortBy === 'name') {
            return sortDirection === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        } else if (sortBy === 'dob') {
            return sortDirection === 'asc'
                ? new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime()
                : new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime()
        } else {
            const dateA = getNextVaccinationDate(a.id)
            const dateB = getNextVaccinationDate(b.id)
            return sortDirection === 'asc'
                ? dateA.localeCompare(dateB)
                : dateB.localeCompare(dateA)
        }
    })

    const paginatedChildren = sortedChildren.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const totalPages = Math.ceil(sortedChildren.length / itemsPerPage)

    const handleSort = (option: SortOption) => {
        if (sortBy === option) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(option)
            setSortDirection('asc')
        }
    }

    const handleEditChild = (child: Child) => {
        setSelectedChild(child);
        setEditChildDialogOpen(true);
    };

    const handleDeleteChild = (id: string, name: string) => {
        setChildToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteChild = async () => {
        if (childToDelete) {
            await deleteChild(childToDelete.id);
            refreshData();
            setDeleteDialogOpen(false);
            setChildToDelete(null);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card className="mt-8 hidden">
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Total Children: {children.length}</p>
                    <p>Children Needing Vaccination: {children.filter(child => getNextVaccinationDate(child.id) !== 'All vaccines completed').length}</p>
                </CardContent>
            </Card>

            <div className="flex items-center space-x-4 mb-6 bg-secondary-muted shadow rounded-md p-4">
                <div className="relative flex-grow flex flex-row space-x-4">
                    <Search01Icon className="absolute left-6 top-2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-4 text-md w-1/2 font-light"
                    />
                    <Button variant="default" className='' onClick={() => setIsAddChildOpen(true)}><UserAdd01Icon className='w-4 flex h-4 mx-2'></UserAdd01Icon>Add Patient</Button>

                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                            <Calendar03Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                                {fromDate && toDate ? (
                                    `${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")}`
                                ) : (
                                    "Filter by vaccination date"
                                )}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={{ from: fromDate, to: toDate }}
                            onSelect={(range) => {
                                setFromDate(range?.from)
                                setToDate(range?.to)
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {(fromDate || toDate) && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setFromDate(undefined)
                            setToDate(undefined)
                        }}
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Clear date range</span>
                        <Cancel01Icon className="h-4 w-4" />
                    </Button>
                )}
                <Select
                    value={sortBy}
                    onValueChange={(value) => handleSort(value as SortOption)}
                >
                    <SelectTrigger className="w-[180px]">
                        <Sorting01Icon className="h-4 w-4" />
                        <SelectValue placeholder="Sort by" />

                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="dob">Date of Birth</SelectItem>
                        <SelectItem value="nextVaccine">Next Vaccination</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                    {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </Button>




            </div>

            {sortedChildren.length === 0 ? (
                <EmptyState message={searchQuery ? "No patients found matching your search." : "No patients added yet. Add a patient to get started."} />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedChildren.map((child) => (
                            <Card key={child.id}>
                                <CardHeader className='flex flex-row justify-between'>
                                    <CardTitle className='font-medium capitalize'>{child.name}</CardTitle>
                                    <Badge variant="outline" className='border-green-500 flex items-center justify-center rounded-full'>
                                        <CardTitle className='font-medium text-xs'>{getCompletedImmunizations(child.id)}</CardTitle>
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Date of Birth:</span>
                                            <Badge variant="secondary">
                                                {new Date(child.dateOfBirth).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Next Vaccination:</span>
                                            <Badge variant="outline" className="flex items-center">
                                                {getNextVaccinationDate(child.id) === 'Completed' ? (
                                                    <>
                                                        <Tick01Icon className="mr-1 h-3 w-3" />
                                                        Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Calendar03Icon className="mr-1 h-3 w-3" />
                                                        {getNextVaccinationDate(child.id)}
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className='flex justify-between'>
                                    <ScheduleDetails
                                        childId={child.id}
                                        childName={child.name}
                                        dateOfBirth={child.dateOfBirth}
                                        refreshData={refreshData}
                                    />

                                    <div className='flex items-center space-x-2'>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditChild(child)}>
                                            <FileEditIcon className="h-4 w-4" />
                                        </Button>
                                        <span className='text-muted-foreground text-light'>|</span>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteChild(child.id, child.name)}>
                                            <UserRemove01Icon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="flex items-center justify-center space-x-4 mt-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ArrowLeft01Icon className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">Page {currentPage} of {totalPages}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            <ArrowRight01Icon className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}

            <EditChildDialog
                isOpen={editChildDialogOpen}
                onClose={() => setEditChildDialogOpen(false)}
                onChildUpdated={refreshData}
                child={selectedChild}
            />
            <AddChildDialog
                isOpen={isAddChildOpen}
                onClose={() => setIsAddChildOpen(false)}
                onChildAdded={refreshData}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className='bg-secondary'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {childToDelete?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className='bg-destructive' onClick={confirmDeleteChild}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}