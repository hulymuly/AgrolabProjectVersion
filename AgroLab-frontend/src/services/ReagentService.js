const API_URL = 'http://89.223.68.165:5005/api/reagents';

const ReagentService = {
    // Метод для добавления нового реагента
    async addReagent(reagent) {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reagent),
        });

        if (!response.ok) {
            throw new Error('Не удалось добавить реагент');
        }
        return await response.json();
    },

    // Метод для получения списка реагентов
    async fetchReagents() {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось получить реагенты');
        }
        return await response.json();
    },

    // Метод для обновления существующего реагента
    async updateReagent(id, updatedReagent) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedReagent),
        });

        if (!response.ok) {
            throw new Error('Не удалось обновить реагент');
        }
        return await response.json();
    },

    // Метод для удаления реагента
    async deleteReagent(id) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось удалить реагент');
        }

        return await response.json();
    }
};

export default ReagentService;
