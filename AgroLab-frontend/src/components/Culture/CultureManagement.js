// CultureManagement.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CultureTable from './CultureTable';
import CultureRepository from '../../Repository/CultureRepository';
import ExportButton from "../common/ExportButton";
import SearchBar from "../common/SearchBar";

const CultureManagement = () => {
    const [cultures, setCultures] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // добавляем состояние для поиска
    const navigate = useNavigate();
    const loadCultures = async () => {
        try {
            const fetchedCultures = await CultureRepository.getCultures();
            setCultures(fetchedCultures);
        } catch (error) {
            console.error('Error fetching cultures:', error);
        }
    };

    useEffect(() => {
        loadCultures();
    }, []);

    // Фильтрация культур по запросу поиска
    const filteredCultures = cultures.filter(culture =>
        (typeof culture === 'object' ? culture.name : culture)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const handleDeleteCulture = async (culture) => {
        try {
            await CultureRepository.deleteCulture(culture);
            loadCultures();
        } catch (error) {
            console.error('Error deleting culture:', error);
            alert(`Ошибка при удалении культуры: ${error.message}`);
        }
    };

    return (
        <div className="container mx-4 p-4 flex flex-col mt-6">
            <button
                className="mr-6 w-1/6 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 self-end mb-4"
                onClick={() => navigate('/add-culture')}
            >
                Добавить культуру
            </button>
            <div className="flex mb-4 w-full">
                <div className="w-2/3">
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                </div>
                <div className="ml-auto py-2 rounded w-1/6 mr-6">
                    <ExportButton
                        data={cultures.map(c => typeof c === 'object' ? c : {name: c})}
                        fileName="Культуры"
                    />
                </div>
            </div>
            <div className="overflow-hidden">
                <CultureTable cultures={filteredCultures} setCultures={setCultures} onDelete={handleDeleteCulture}/>
            </div>

        </div>
    );
};

export default CultureManagement;