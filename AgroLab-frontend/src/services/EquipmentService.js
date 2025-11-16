const API_URL = 'http://89.223.68.165:5005/api/equipment';

const EquipmentService = {
    // Метод для добавления нового оборудования
    async addEquipment(equipment) {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(equipment),
        });

        if (!response.ok) {
            throw new Error('Не удалось добавить оборудование');
        }
        return await response.json();
    },

    // Метод для получения списка оборудования
    async fetchEquipment() {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось получить оборудование');
        }
        return await response.json();
    },

    // Метод для обновления существующего оборудования
    async updateEquipment(id, updatedEquipment) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEquipment),
        });

        if (!response.ok) {
            throw new Error('Не удалось обновить оборудование');
        }
        return await response.json();
    },

    // Метод для удаления оборудования
    async deleteEquipment(id) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось удалить оборудование');
        }
        return await response.json();
    }
};

export default EquipmentService;
