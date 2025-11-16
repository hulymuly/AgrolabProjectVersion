// AddReagentForm.jsx
import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useReagentRepository from '../../Repository/ReagentRepository';

const AddReagentForm = ({ onAdd }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { reagent } = location.state || {};
    const reagentRepository = useReagentRepository();

    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        batch: '',
        supplier: '',
        expiryDate: '',
        stock: '',
        consumption: '',
    });

    useEffect(() => {
        if (reagent) {
            setFormData(reagent);
            setIsEditMode(true);
        }
    }, [reagent]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Проверка обязательных полей
        if (!formData.name) newErrors.name = 'Имя реактива обязательно';
        if (!formData.date) newErrors.date = 'Дата обязательна';
        if (!formData.batch) newErrors.batch = 'Партия обязательна';
        if (!formData.supplier) newErrors.supplier = 'Поставщик обязателен';
        if (!formData.expiryDate) newErrors.expiryDate = 'Срок годности обязателен';
        if (!formData.stock) newErrors.stock = 'Остатки обязательны';
        if (formData.stock && (isNaN(formData.stock) || Number(formData.stock) < 0)) {
            newErrors.stock = 'Остатки должны быть положительным числом';
        }
        if (formData.consumption && (isNaN(formData.consumption) || Number(formData.consumption) < 0)) {
            newErrors.consumption = 'Расход должен быть положительным числом';
        }
        
        // Проверка дат
        if (formData.date && formData.expiryDate) {
            const startDate = new Date(formData.date);
            const endDate = new Date(formData.expiryDate);
            if (endDate < startDate) {
                newErrors.expiryDate = 'Срок годности не может быть раньше даты получения';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                let updatedData = { ...formData };

                if (formData.consumption) {
                    const newStock = Number(formData.stock) - Number(formData.consumption);
                    if (newStock < 0) {
                        setErrors({ consumption: 'Расход превышает текущий остаток' });
                        return;
                    }
                    updatedData.stock = newStock.toString();
                }

                if (isEditMode) {
                    await reagentRepository.updateReagent(formData.id, updatedData);
                } else {
                    await reagentRepository.addReagent(updatedData);
                }

                navigate('/reagent-table');
            } catch (error) {
                console.error('Ошибка при сохранении реактива:', error);
                setErrors({ submit: 'Ошибка при сохранении реактива. Пожалуйста, попробуйте снова.' });
            }
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center mt-16 pt-4 p-8">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mr-4">
                <h2 className="text-xl font-semibold mb-6">
                    {isEditMode ? 'Редактирование реактива' : 'Добавление нового реактива'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Имя</label>
                        <input
                            className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded`}
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Дата</label>
                        <input
                            className={`w-full p-3 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded`}
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Партия</label>
                        <input
                            className={`w-full p-3 border ${errors.batch ? 'border-red-500' : 'border-gray-300'} rounded`}
                            type="text"
                            name="batch"
                            value={formData.batch}
                            onChange={handleChange}
                            required
                        />
                        {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Поставщик</label>
                        <input
                            className={`w-full p-3 border ${errors.supplier ? 'border-red-500' : 'border-gray-300'} rounded`}
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            required
                        />
                        {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Срок годности</label>
                        <input
                            className={`w-full p-3 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded`}
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            required
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Остатки</label>
                        <input
                            className={`w-full p-3 border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded`}
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                        {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Расход</label>
                        <input
                            className={`w-full p-3 border ${errors.consumption ? 'border-red-500' : 'border-gray-300'} rounded`}
                            type="number"
                            name="consumption"
                            value={formData.consumption}
                            onChange={handleChange}
                            min="0"
                        />
                        {errors.consumption && <p className="text-red-500 text-sm mt-1">{errors.consumption}</p>}
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/reagent-table')}
                            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded shadow"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded shadow"
                        >
                            {isEditMode ? 'Сохранить изменения' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReagentForm;