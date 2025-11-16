// ReagentManagement.jsx
import React, { useState, useEffect } from 'react';
import ReagentTable from './ReagentTable';
import AddReagentForm from './AddReagentForm';
import useReagentRepository from '../../Repository/ReagentRepository'
import { useNavigate } from 'react-router-dom';
import SearchBar from "../common/SearchBar";
import ExportButton from "../common/ExportButton";

const ReagentManagement = () => {
    const { reagentList, loading, error, addReagent, fetchReagents,deleteReagent } = useReagentRepository(); // Используйте хук
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReagents();
    }, [fetchReagents]);

    const handleDeleteReagent = async (id) => {
        try {
            await deleteReagent(id);
            await fetchReagents(); // Refresh the list
        } catch (err) {
            alert(`Ошибка при удалении: ${err.message}`);
        }
    };

    const filteredReagents = reagentList.filter(reagent =>
        Object.values(reagent).some(value =>
            value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="container mx-4 p-4">
            <div className="flex flex-col w-full">
                <button
                    className="bg-gradient-to-r from-orange-400 to-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mb-4 w-1/6 self-end m-6"
                    onClick={() => navigate('/reagents/add')}
                >
                    Добавить реактив
                </button>
                <div className="flex mb-4 w-full">
                    <div className="w-2/3">
                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                    </div>
                    <div className="ml-auto py-2 rounded w-1/6 mr-6">
                        <ExportButton
                            data={reagentList}
                            fileName="Реагенты"
                        />
                    </div>
                </div>
                <ReagentTable reagents={filteredReagents} onDelete={handleDeleteReagent}/>
            </div>
        </div>
    );
};

export default ReagentManagement;