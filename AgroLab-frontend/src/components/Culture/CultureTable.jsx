import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import DeleteButton from "../common/DeleteButton";
import ExportButton from "../common/ExportButton";

const CultureTable = ({ cultures, setCultures, onDelete }) => {
    const [sortOrder, setSortOrder] = useState('asc');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role?.toLowerCase() === 'admin';

    const handleSort = () => {
        const sortedCultures = [...cultures].sort((a, b) => {
            const nameA = typeof a === 'object' ? a.name ?? '' : a;
            const nameB = typeof b === 'object' ? b.name ?? '' : b;

            return sortOrder === 'asc'
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });

        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setCultures(sortedCultures);
    };

    const handleRowDoubleClick = (culture) => {
        navigate('/add-culture', { state: { culture } });
    };

    if (!cultures || cultures.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-center text-gray-500">Нет доступных культур</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col shadow-md w-full bg-white">
            <table className="w-full rounded-lg table-scroll">
                <thead className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                <tr>
                    <th onClick={handleSort}
                        className="cursor-pointer text-left pl-6 p-2 text-xs font-bold uppercase tracking-wider">
                        Наименование
                    </th>
                    <th className="cursor-pointer text-right p-2"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {cultures.map((culture, index) => (
                    <tr
                        key={index}
                        className="hover:bg-gray-50 cursor-pointer"
                        onDoubleClick={() => handleRowDoubleClick(culture)}
                    >
                        <td className="px-6 py-4 whitespace-nowrap">
                            {typeof culture === 'object' ? culture.name : culture}
                        </td>
                        <td className="px-6 py-1 whitespace-nowrap text-right text-sm font-medium">
                            <DeleteButton
                                onDelete={() => onDelete(culture)}
                                itemName="культуру"
                                isAdmin={isAdmin}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CultureTable;
