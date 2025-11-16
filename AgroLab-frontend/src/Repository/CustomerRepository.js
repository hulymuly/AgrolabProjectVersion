import { useEffect, useState } from "react";
import CustomerService from '../services/CustomerService'; // Используем реальный сервис

const useCustomerRepository = () => {
    const [customerList, setCustomerList] = useState([]); // Список клиентов
    const [loading, setLoading] = useState(true); // Статус загрузки
    const [error, setError] = useState(null); // Ошибка, если она возникла

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const customers = await CustomerService.fetchCustomers(); // Используем реальный сервис
                setCustomerList(customers); // Обновите список клиентов
            } catch (err) {
                setError(err.message); // Установите сообщение об ошибке
            } finally {
                setLoading(false); // Завершите загрузку
            }
        };

        fetchCustomers(); // Вызовите функцию для получения клиентов
    }, []);

    // Метод для добавления клиента
    const addCustomer = async (newCustomer) => {
        try {
            if (newCustomer.id) {
                // Обновите существующего клиента
                const updatedCustomers = customerList.map(customer =>
                    customer.id === newCustomer.id ? newCustomer : customer
                );
                setCustomerList(updatedCustomers); // Обновите список клиентов
                return newCustomer;
            } else {
                const addedCustomer = await CustomerService.addCustomer(newCustomer);
                setCustomerList([...customerList, addedCustomer]); // Обновите список клиентов
                return addedCustomer;
            }
        } catch (err) {
            setError(err.message); // Установите сообщение об ошибке
            throw err;
        }
    };

    // Метод для обновления клиента
    const updateCustomer = async (id, updatedCustomer) => {
        try {
            const result = await CustomerService.updateCustomer(id, updatedCustomer);
            await fetchCustomers(); // Обновляем список после обновления
            return result;
        } catch (err) {
            setError(err.message); // Установите сообщение об ошибке
            throw err;
        }
    };

    const deleteCustomer = async (id) => {
        try {
            await CustomerService.deleteCustomer(id);
            const updatedCustomers = customerList.filter(customer => customer.id !== id);
            setCustomerList(updatedCustomers);
            return { success: true };
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return { customerList, loading, error, addCustomer, updateCustomer, deleteCustomer }; // Возвращаем данные и методы
};

export default useCustomerRepository;
