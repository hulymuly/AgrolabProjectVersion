const API_URL = 'http://89.223.68.165:5005/api/customers';

const CustomerService = {
    // Метод для добавления нового клиента
    async addCustomer(customer) {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customer),
        });

        if (!response.ok) {
            throw new Error('Не удалось добавить клиента');
        }
        return await response.json();
    },

    // Метод для получения списка клиентов
    async fetchCustomers() {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось получить клиентов');
        }
        return await response.json();
    },

    // Метод для обновления существующего клиента
    async updateCustomer(id, updatedCustomer) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCustomer),
        });

        if (!response.ok) {
            throw new Error('Не удалось обновить клиента');
        }
        return await response.json();
    },

    // Метод для удаления клиента
    async deleteCustomer(id) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось удалить клиента');
        }
        return await response.json();
    },
};

export default CustomerService;
