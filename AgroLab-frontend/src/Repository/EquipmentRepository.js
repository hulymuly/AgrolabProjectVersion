import { useState, useEffect } from 'react';
import EquipmentService from '../services/EquipmentService';
// import MockEquipmentService from "../components/Mockups/MockEquipmentService";

const isMock = false; // Моки отключены

const useEquipmentRepository = (equipmentService = EquipmentService) => {
    const [equipmentList, setEquipmentList] = useState([]); // Список оборудования
    const [loading, setLoading] = useState(false); // Статус загрузки
    const [error, setError] = useState(null); // Ошибка, если она возникла

    // Метод для получения оборудования
    const fetchEquipment = async () => {
        setLoading(true); // Начинаем загрузку
        try {
            const data = await equipmentService.fetchEquipment(); // Получаем оборудование
            setEquipmentList(data); // Обновляем список оборудования
        } catch (err) {
            setError(err.message); // Устанавливаем сообщение об ошибке
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };

    // Метод для добавления оборудования
    const addEquipment = async (newEquipment) => {
        try {
            await equipmentService.addEquipment(newEquipment); // Добавляем новое оборудование
        } catch (err) {
            setError(err.message); // Устанавливаем сообщение об ошибке
        }
    };

    // Метод для обновления оборудования
    const updateEquipment = async (id, updatedEquipment) => {
        try {
            const result = await equipmentService.updateEquipment(id, updatedEquipment);
            await fetchEquipment(); // Обновляем список
            return result;
        } catch (err) {
            setError(err.message); // Устанавливаем сообщение об ошибке
            throw err;
        }
    };

    // Метод для удаления оборудования
    const deleteEquipment = async (id) => {
        try {
            const result = await equipmentService.deleteEquipment(id);
            await fetchEquipment(); // Обновляем список
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchEquipment(); // Загружаем оборудование при монтировании компонента
    }, []);

    return {
        equipmentList,
        loading,
        error,
        addEquipment,
        updateEquipment,
        deleteEquipment
    }; // Возвращаем данные и методы
};

export default useEquipmentRepository;
