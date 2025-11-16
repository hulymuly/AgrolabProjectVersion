// EquipmentManagement.jsx
import React, {useState} from 'react';
import EquipmentTable from './EquipmentTable';
import { useNavigate } from 'react-router-dom';
import useEquipmentRepository from '../../Repository/EquipmentRepository';

import ExportButton from "../common/ExportButton";
import SearchBar from "../common/SearchBar";

const EquipmentManagement = () => {
    const {equipmentList, loading, error, deleteEquipment} = useEquipmentRepository();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleDeleteEquipment = async (id) => {
        try {
            await deleteEquipment(id);
        } catch (error) {
            console.error('Error deleting equipment:', error);
            alert('Ошибка при удалении оборудования');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const filteredEquipment = equipmentList.filter(equipment =>
        Object.values(equipment).some(value =>
            value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="flex flex-col w-full pt-6 p-8">
            <button
                onClick={() => navigate('/add-equipment')}
                className="bg-gradient-to-r from-orange-400 to-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded my-4 self-end w-1/6 mr-4"
            >
                Добавить оборудование
            </button>

            <div className="flex mb-4 w-full">
                <div className="w-2/3">
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                </div>
                <div className="ml-auto py-2 rounded w-1/6 mr-4">
                    <ExportButton
                        data={filteredEquipment}
                        fileName="Оборудование"
                    />
                </div>
            </div>

            <div className="overflow-hidden w-full rounded-lg">
                <EquipmentTable equipmentList={filteredEquipment} onDelete={handleDeleteEquipment}/>
            </div>
        </div>
    );
};

export default EquipmentManagement;