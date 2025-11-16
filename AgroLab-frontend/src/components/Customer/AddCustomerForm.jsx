import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCustomerRepository from '../../Repository/CustomerRepository';

const AddCustomerForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { customer } = location.state || {};
    const { addCustomer } = useCustomerRepository();

    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        inn: '',
        kpp: '',
        org_and_legal_form: '',
        address: '',
    });

    useEffect(() => {
        if (customer) {
            setFormData(customer);
            setIsEditMode(true);
        }
    }, [customer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Название организации обязательно';
        if (!formData.inn) newErrors.inn = 'ИНН обязателен';
        if (!formData.kpp) newErrors.kpp = 'КПП обязателен';
        if (!formData.org_and_legal_form) newErrors.org_and_legal_form = 'Организационно-правовая форма обязательна';
        if (!formData.address) newErrors.address = 'Адрес обязателен';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                await addCustomer(formData);
                navigate('/customers');
            } catch (error) {
                console.error('Error saving customer:', error);
                setErrors({ submit: 'Ошибка при сохранении заказчика. Пожалуйста, попробуйте снова.' });
            }
        }
    };

    const handleCancel = () => {
        navigate('/customers');
    };

    return (
        <div className="flex-1 p-16 md:p-12 lg:p-8">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    {isEditMode ? 'Редактирование заказчика' : 'Добавление нового заказчика'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 lg:gap-6">
                        <div>
                            <label className="block mb-1 text-gray-700">Имя*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">ИНН</label>
                            <input
                                type="text"
                                name="inn"
                                value={formData.inn}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.inn ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.inn && <p className="text-red-500 text-sm mt-1">{errors.inn}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">КПП</label>
                            <input
                                type="text"
                                name="kpp"
                                value={formData.kpp}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.kpp ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.kpp && <p className="text-red-500 text-sm mt-1">{errors.kpp}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Организационно-правовая форма*</label>
                            <input
                                type="text"
                                name="org_and_legal_form"
                                value={formData.org_and_legal_form}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.org_and_legal_form ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.org_and_legal_form && <p className="text-red-500 text-sm mt-1">{errors.org_and_legal_form}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Адрес*</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {errors.submit}
                        </div>
                    )}

                    <div className="flex justify-between mt-8 space-x-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
                        >
                            {isEditMode ? 'Сохранить изменения' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerForm;
