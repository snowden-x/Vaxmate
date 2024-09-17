import React from 'react';
import { Button } from "@/components/ui/button";
import { Download03Icon } from 'hugeicons-react';

interface ExportButtonProps {
    onExport: (format: 'pdf' | 'excel') => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
    return (
        <div className="flex space-x-2 mr-5">
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                <Download03Icon  className="mr-2 h-5 w-5" />
                Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('excel')}>
                <Download03Icon className="mr-2 h-5 w-5" />
                Export Excel
            </Button>
        </div>
    );
};

export default ExportButton;