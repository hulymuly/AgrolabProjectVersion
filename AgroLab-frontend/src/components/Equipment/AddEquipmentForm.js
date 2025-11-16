import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useEquipmentRepository from "../../Repository/EquipmentRepository";

const AddEquipmentForm = ({ initialData, onSave, mode, onAdd }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Get location to access state
    const { equipment } = location.state || {}; // Extract equipment from state if it exists
    const [isEditMode, setIsEditMode] = useState(false); // Track if we're in edit mode
    const { addEquipment, updateEquipment } = useEquipmentRepository();

    const [formData, setFormData] = useState(initialData || {
        name: '',
        category: '',
        model: '',
        inventoryNumber: '',
        factoryNumber: '',
        dateOfCommissioning: '',
        certificateNumber: '',
        inspectionDate: '',
        validUntilDate: '',
        width: '',
        length: '',
        height: '',
        depth: '',
        dateOfDecommissioning: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (equipment) {
            setFormData(equipment);
            setIsEditMode(true);
        }
    }, [equipment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Название обязательно';
        if (!formData.category) newErrors.category = 'Категория обязательна';
        if (!formData.model) newErrors.model = 'Модель обязательна';
        if (!formData.inventoryNumber) newErrors.inventoryNumber = 'Номер инвентаря обязателен';
        if (!formData.factoryNumber) newErrors.factoryNumber = 'Номер завода обязателен';
        if (!formData.dateOfCommissioning) newErrors.dateOfCommissioning = 'Дата ввода в эксплуатацию обязательна';
        if (!formData.certificateNumber) newErrors.certificateNumber = 'Номер свидетельства обязателен';
        if (!formData.inspectionDate) newErrors.inspectionDate = 'Дата проверки обязательна';
        if (!formData.validUntilDate) newErrors.validUntilDate = 'Годен до обязательна';
        if (!formData.width || isNaN(formData.width) || Number(formData.width) < 0) newErrors.width = 'Ширина должна быть положительным числом';
        if (!formData.length || isNaN(formData.length) || Number(formData.length) < 0) newErrors.length = 'Длина должна быть положительным числом';
        if (!formData.height || isNaN(formData.height) || Number(formData.height) < 0) newErrors.height = 'Высота должна быть положительным числом';
        if (!formData.depth || isNaN(formData.depth) || Number(formData.depth) < 0) newErrors.depth = 'Глубина должна быть положительным числом';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                if (isEditMode) {
                    // Update existing equipment
                    await updateEquipment(formData.id, formData);
                } else {
                    // Add new equipment
                    await addEquipment(formData);
                }
                navigate('/equipment-table');
            } catch (error) {
                console.error('Error saving equipment:', error);
                setErrors({ submit: 'Error saving equipment. Please try again.' });
            }
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md mt-20">
            <div className="flex justify-end">
                <button className="text-red-500" onClick={() => navigate('/equipment-table')}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <form className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4" onSubmit={handleSubmit}>
                {Object.keys(formData).filter(key => key !== 'id').map((key, index) => (
                    <div key={index}>
                        <label className="block text-gray-700">{{
                            name: 'Название',
                            category: 'Категория',
                            model: 'Модель',
                            inventoryNumber: 'Номер инвентаря',
                            factoryNumber: 'Номер завода',
                            dateOfCommissioning: 'Дата ввода в эксплуатацию',
                            certificateNumber: 'Номер свидетельства',
                            inspectionDate: 'Дата проверки',
                            validUntilDate: 'Годен до',
                            width: 'Ширина',
                            length: 'Длина',
                            height: 'Высота',
                            depth: 'Глубина',
                            dateOfDecommissioning: 'Дата вывода из использования'
                        }[key]}</label>
                        <input
                            type={key.toLowerCase().includes('date') ? 'date' : 'text'}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            required = {key !== 'dateOfDecommissioning'}
                        />
                        {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
                    </div>
                ))}
                <div className="col-span-3 flex justify-center mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/equipment-table')}
                        className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow mr-4"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="bg-orange-500 text-white px-4 py-2 rounded"
                    >
                        {isEditMode ? 'Сохранить изменения' : 'Добавить оборудование'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEquipmentForm;