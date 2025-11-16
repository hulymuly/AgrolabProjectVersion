//на основе этого стиля создай компоненты регистрации и авторизации(поля в базе name, surname,login,password,role(Admin/User), объект пользователя должен сохраняться в системе, а регистрации сотрудников доступна только пользователю с ролю Admin
// src/components/MainContent.js
import React from 'react';
import RegistrayionForm from '../Auth/RegistrationForm';
import LoginForm from '../Auth/LoginForm';
// import './../styles/MainContent.css';

const MainContent = () => {
    return (
        <div class="flex-1 p-4">
            <div class="bg-white p-6 rounded-lg shadow-md h-full">
                <h2 class="text-lg font-bold mb-4">Общие настройки</h2>
                <form>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block mb-1 text-gray-700">Наименование</label>
                            <input type="text" value="Нормативный документ N201"
                                   class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label class="block mb-1 text-gray-700">Обозначение</label>
                            <input type="text" value="Demo" class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block mb-1 text-gray-700">Официальное наименование</label>
                            <input type="text" class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label class="block mb-1 text-gray-700">Тип нормативного документа</label>
                            <input type="text" value="Методики испытаний"
                                   class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block mb-1 text-gray-700">Номер приказа о введении</label>
                            <input type="text" class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label class="block mb-1 text-gray-700">Описание</label>
                            <textarea class="w-full p-2 border border-gray-300 rounded h-24">-</textarea>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block mb-1 text-gray-700">Дата принятия</label>
                            <input type="date" class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label class="block mb-1 text-gray-700">Дата начала действия</label>
                            <input type="date" class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                        <div>
                            <label class="block mb-1 text-gray-700">Дата окончания действия</label>
                            <input type="date" class="w-full p-2 border border-gray-300 rounded"/>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button class="bg-white hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">Отменить
                        </button>
                        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Сохранить
                        </button>
                    </div>
                </form>
            </div>
            </div>
        );
};

export default MainContent;