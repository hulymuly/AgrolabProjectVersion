import React, { useState } from 'react';
import AuthRepository from '../../Repository/AuthRepository';

const RegistrationForm = ({ isAdmin }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        login: '',
        password: '',
        role: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === 'checkbox' ? (checked ? 'admin' : '') : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const authRepository = new AuthRepository();
            const success = await authRepository.registerUser(formData);
            if (success) {
                console.log('User registered successfully');
            } else {
                console.log('Registration failed');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!isAdmin) {
        return <div className="text-red-500">Только администраторы могут регистрировать новых пользователей.</div>;
    }

    return (
        <div className="flex-1 flex items-center justify-center pl-0 p-8" style={{backgroundColor: '#F7F4F2'}}>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Регистрация нового пользователя</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Имя"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Фамилия"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Логин"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Пароль"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <span className="text-gray-700">Права пользователя</span>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="admin"
                                name="role"
                                value="admin"
                                onChange={handleChange}
                                className="mr-2 accent-orange-600"
                            />
                            <label htmlFor="admin" className="text-gray-700">Администратор</label>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700"
                    >
                        Сохранить
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;