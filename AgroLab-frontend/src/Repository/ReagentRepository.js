import { useState, useEffect } from 'react';
import ReagentService from '../services/ReagentService';
// import MockReagentService from '../components/Mockups/MockReagentService'; // Импорт мока отключён

const useMock = false; // Моки отключены
const useReagentRepository = (reagentService = ReagentService) => {
    // Моки отключены, используется только реальный сервис

    const [reagentList, setReagentList] = useState([]); // Список реагентов
    const [loading, setLoading] = useState(false); // Статус загрузки
    const [error, setError] = useState(null); // Ошибка, если она возникла

    // Метод для добавления реагента
    const addReagent = async (reagent) => {
        try {
            await reagentService.addReagent(reagent); // Добавляем новый реагент
            await fetchReagents(); // Обновляем список реагентов
        } catch (err) {
            setError(err.message); // Устанавливаем сообщение об ошибке
        }
    };

    // Метод для обновления реагента
    const updateReagent = async (id, updatedReagent) => {
        try {
            const result = await reagentService.updateReagent(id, updatedReagent);
            await fetchReagents(); // Обновляем список
            return result;
        } catch (err) {
            setError(err.message); // Устанавливаем сообщение об ошибке
            throw err;
        }
    };

    const deleteReagent = async (id) => {
        try {
            const result = await reagentService.deleteReagent(id);
            await fetchReagents(); // Refresh the list
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Метод для получения реагентов
    const fetchReagents = async () => {
        setLoading(true); // Начинаем загрузку
        try {
            const data = await reagentService.fetchReagents(); // Получаем реагенты
            setReagentList(data); // Обновляем список реагентов
        } catch (err) {
            setError(err.message); // Устанавливаем сообщение об ошибке
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };

    useEffect(() => {
        fetchReagents(); // Загружаем реагенты при монтировании компонента
    }, []);

    return {
        reagentList,
        loading,
        error,
        addReagent,
        updateReagent,
        fetchReagents,
        deleteReagent,
    }; // Возвращаем данные и методы
};

export default useReagentRepository;