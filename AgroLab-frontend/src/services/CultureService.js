const API_URL = 'http://89.223.68.165:5005/api/cultures';

const CultureService = {
    // Метод для получения списка культур
    async fetchCultures() {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось получить культуры');
        }

        return await response.json();
    },

    // Метод для добавления новой культуры
    async addCulture(culture) {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(culture),
        });

        if (!response.ok) {
            throw new Error('Не удалось добавить культуру');
        }

        return await response.json();
    },

    // Метод для обновления существующей культуры (по ID)
    async updateCulture(cultureId, newCulture) {
        const token = localStorage.getItem('token');
        const url = `${API_URL}/${cultureId}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCulture),
        });

        if (!response.ok) {
            throw new Error('Не удалось обновить культуру');
        }

        return await response.json();
    },

    // Метод для удаления культуры по ID
    async deleteCulture(cultureId) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/${cultureId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось удалить культуру');
        }

        return await response.json();
    }
};

export default CultureService;
