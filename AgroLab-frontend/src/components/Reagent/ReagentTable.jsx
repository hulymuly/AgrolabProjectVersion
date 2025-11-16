// ReagentTable.jsx
import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import DeleteButton from "../common/DeleteButton";
import styles from "../../styles.css"
import ExportButton from "../common/ExportButton";
import SearchBar from "../common/SearchBar";

const getExpiryColor = (expiryDate) => {
    if (!expiryDate) return 'bg-gray-300'; // Default color if no date is set
    const expiryDateObj = new Date(expiryDate);
    const today = new Date();
    const diffInDays = Math.round((expiryDateObj - today) / (1000 * 60 * 60 * 24));
    if (diffInDays <= 7) return 'bg-red-400'; // Red if less than or equal to 1 week
    if (diffInDays <= 14) return 'bg-orange-400'; // Orange if less than or equal to 2 weeks
    if (diffInDays <= 30) return 'bg-yellow-400'; // Yellow if less than 1 month
    return 'bg-green-500'; // Green if more than 1 month
};

const ReagentTable = ({ reagents, onDelete  }) => {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({key: 'name', direction: 'ascending'});

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role?.toLowerCase() === 'admin';


    const sortedReagents = [...reagents].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});
    };

    const handleRowDoubleClick = (reagent) => {
        navigate('/reagents/edit', {state: {reagent}});
    };



    return (
        <div className="w-full flex flex-col">
            <div className="bg-white rounded-lg shadow-md overflow-hidden text-center text-xs">

                <table className="w-full table-scroll">
                    <thead className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                    <tr>
                        <th onClick={() => requestSort('name')}
                            className="cursor-pointer px-6 py-3 font-medium uppercase tracking-wider">Имя
                        </th>
                        <th onClick={() => requestSort('date')}
                            className="cursor-pointer px-6 py-3 font-medium uppercase tracking-wider">Дата
                        </th>
                        <th onClick={() => requestSort('batch')}
                            className="cursor-pointer px-6 py-3 font-medium uppercase tracking-wider">Партия
                        </th>
                        <th onClick={() => requestSort('supplier')}
                            className="cursor-pointer px-6 py-3 font-medium uppercase tracking-wider">Поставщик
                        </th>
                        <th onClick={() => requestSort('expiryDate')}
                            className="cursor-pointer px-6 py-3 font-medium uppercase tracking-wider">Срок
                            годности
                        </th>
                        <th onClick={() => requestSort('stock')}
                            className="cursor-pointer px-6 py-3 text-xs font-medium uppercase tracking-wider">Остаток
                        </th>
                        <th onClick={() => requestSort('stock')}
                            className="cursor-pointer px-6 py-3 text-xs font-medium uppercase tracking-wider"></th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {sortedReagents.map((reagent) => (
                        <tr
                            key={reagent.id}
                            className="hover:bg-gray-100"
                            onDoubleClick={() => handleRowDoubleClick(reagent)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">{reagent.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{reagent.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{reagent.batch}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{reagent.supplier}</td>
                            <td className="px-6 py-4 whitespace-nowrap flex justify-start items-center">
                                <div
                                    className={`${getExpiryColor(reagent.expiryDate)} text-white px-2 py-1 rounded-full text-center`}>
                                    {reagent.expiryDate}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{reagent.stock}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right font-medium">
                                <DeleteButton
                                    onDelete={() => onDelete(reagent.id)}
                                    itemName="реактив"
                                    isAdmin={isAdmin}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReagentTable;