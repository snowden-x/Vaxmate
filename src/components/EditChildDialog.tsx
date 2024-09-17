import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateChild, updateSchedule, getSchedule, calculateVaccineDates } from '@/lib/db';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EditChildDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onChildUpdated: () => void;
    child: { id: string; name: string; dateOfBirth: string } | null;
}

export default function EditChildDialog({ isOpen, onClose, onChildUpdated, child }: EditChildDialogProps) {
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (child) {
            setName(child.name);
            setDateOfBirth(child.dateOfBirth);
        }
    }, [child]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (child && name && dateOfBirth) {
            if (dateOfBirth !== child.dateOfBirth) {
                setShowWarning(true);
            } else {
                await updateChild(child.id, name, dateOfBirth);
                onChildUpdated();
                onClose();
            }
        }
    };

    const handleConfirmUpdate = async () => {
        if (child) {
            await updateChild(child.id, name, dateOfBirth);
            const newSchedule = calculateVaccineDates(dateOfBirth);
            await updateSchedule(child.id, newSchedule);
            onChildUpdated();
            onClose();
            setShowWarning(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className='bg-white'>
                    <DialogHeader>
                        <DialogTitle>Edit Patient Details</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-3 capitalize"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dob" className="text-right">
                                    Date of Birth
                                </Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent className='bg-secondary'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Warning</AlertDialogTitle>
                        <AlertDialogDescription>
                            Changing the date of birth will update the vaccination schedule. Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className='bg-destructive' onClick={handleConfirmUpdate}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}