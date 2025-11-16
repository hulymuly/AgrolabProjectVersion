// src/components/common/ExportButton.jsx
import React from 'react';
import { exportToExcel } from "../../utils/excelExport";

const ExportButton = ({ data, fileName, includeRelated = false }) => {
    const handleExport = () => {
        exportToExcel(data, fileName + new Date().toISOString().slice(0, 10), includeRelated);
    };

    return (
        <button
            onClick={handleExport}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
        >
            <i className="fas fa-file-excel mr-2"></i>
            Экспорт в Excel
        </button>
    );
};

export default ExportButton;