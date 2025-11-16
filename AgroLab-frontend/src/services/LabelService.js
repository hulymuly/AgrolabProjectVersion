import axios from 'axios';

const API_BASE_URL = 'http://89.223.68.165:5005/api/labels';

const labelService = {
    // Старый метод — если вдруг где-то используется без ID
    submitLabel: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}`, data);
            return response.data;
        } catch (error) {
            console.error("Ошибка при отправке метки:", error);
            throw error;
        }
    },

    // Обновлённый метод — генерация и скачивание .docx по ID и категории
    submitLabelWithId: async (category, id, data) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/${category}/${id}`, // <-- исправлено: шаблонная строка
                data,
                {
                    responseType: 'blob', // ожидаем файл
                    headers: {
                        'Content-Type': 'application/json' // важно для ASP.NET
                    }
                }
            );
            return response;
        } catch (error) {
            console.error("Ошибка при создании этикетки:", error.response || error.message);
            throw error;
        }
    }
};

export default labelService;
