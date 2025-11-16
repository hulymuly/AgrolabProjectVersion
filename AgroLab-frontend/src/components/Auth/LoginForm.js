// src/components/LoginForm.js
import React, {useState} from 'react';
import AuthRepository from "../../Repository/AuthRepository";
import useReagentRepository from "../../Repository/ReagentRepository";
import {useNavigate} from "react-router-dom";

const LoginForm = () => {
    var navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        login: '',
        password: '',
    });

    const {reagentList} = useReagentRepository(); // Используйте хук


    const handleChange = (e) => {
        const {name, value} = e.target;
        setCredentials({...credentials, [name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const authRepository = new AuthRepository();
            const success = await authRepository.loginUser(credentials);
            if (success) {
                navigate("/");

                // Проверка срока годности
                const today = new Date();
                reagentList.forEach(reagent => {
                    const expiryDate = new Date(reagent.expiryDate);
                    const diffInDays = Math.round((expiryDate - today) / (1000 * 60 * 60 * 24));

                    if (diffInDays < 3) {
                        alert(`Реагент: ${reagent.name}, Осталось: ${diffInDays} дней`);
                    }
                });
            } else {
                console.log('Invalid credentials');
            }
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div className="bg-cover bg-center h-screen w-screen" style={{ backgroundImage: "url('./AuthBackground.png')" }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <img src="Logo.png" alt="Логотип" className="w-32"/>
            </div>
            <div className="flex items-center justify-center h-full">
                <div className="bg-gray-500 bg-opacity-10 p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-center text-white text-xl font-light mb-4">
                        <span>Добро пожаловать в приложение</span>
                        <div>
                            <span className="font-semibold">«Учет Агродоктор»</span>
                        </div>
                    </h2>
                    <p className="text-center text-gray-400 mb-6">Введите логин и пароль</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <div className="flex items-center bg-white rounded-lg shadow-sm">
                                <span className="px-3 text-gray-500"><i className="fas fa-user"></i></span>
                                <input type="text" name="login" value={credentials.login} onChange={handleChange}
                                       className="w-full py-2 px-3 rounded-r-lg focus:outline-none" placeholder="Логин" required/>
                            </div>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center bg-white rounded-lg shadow-sm">
                                <span className="px-3 text-gray-500"><i className="fas fa-lock"></i></span>
                                <input type="password" name="password" value={credentials.password} onChange={handleChange}
                                       className="w-full py-2 px-3 rounded-r-lg focus:outline-none" placeholder="Пароль" required/>
                            </div>
                        </div>
                        <button
                            className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                            type="submit">Войти
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;