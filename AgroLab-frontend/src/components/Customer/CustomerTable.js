// CustomerTable.jsx
import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import DeleteButton from "../common/DeleteButton";

const CustomerTable = ({ customerList, onDeleteCustomer }) => {
    const navigate = useNavigate(); // Initialize navigate
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role?.toLowerCase() === 'admin';



    const sortedCustomers = [...customerList].sort((a, b) => {
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
        setSortConfig({ key, direction });
    };

    const handleRowDoubleClick = (customer) => {
        navigate('/customers/edit', { state: { customer } });
    };

    if (!customerList || customerList.length === 0) {
        return <div className="text-center p-4">Нет доступных заказчиков.</div>;
    }

    return (
        <div className="w-full flex flex-col">
            <div className="bg-white rounded-lg shadow-md overflow-hidden text-center">
                <table className="w-full table-scroll">
                    <thead className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                    <tr>
                        <th onClick={() => requestSort('name')}
                            className="cursor-pointer px-6 py-3 text-xs font-medium uppercase tracking-wider">Название
                        </th>
                        <th onClick={() => requestSort('inn')}
                            className="cursor-pointer px-6 py-3 text-xs font-medium uppercase tracking-wider">
                            ИНН
                        </th>
                        <th onClick={() => requestSort('kpp')}
                            className="cursor-pointer px-6 py-3 text-xs font-medium uppercase tracking-wider">
                            КПП
                        </th>
                        <th onClick={() => requestSort('org_and_legal_form')}
                            className="cursor-pointer px-6 py-3 text-xs font-medium uppercase tracking-wider">Организационно-правовая форма
                        </th>
                        <th onClick={() => requestSort('address')}
                            className="cursor-pointer px-6 py-3 text-xs font-medium uppercase tracking-wider">Адрес
                        </th>
                        <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"></th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {sortedCustomers.map((customer, index) => (
                        <tr
                            key={index}
                            className="hover:bg-gray-100"
                            onDoubleClick={() => handleRowDoubleClick(customer)} // Add double-click handler
                        >
                            <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{customer.inn}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{customer.kpp}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{customer.org_and_legal_form}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{customer.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <DeleteButton
                                    onDelete={() => onDeleteCustomer(customer.id)}
                                    itemName="заказчика"
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

export default CustomerTable;