const API_URL = 'http://89.223.68.165:5005/api/samples';

const SampleService = {
    getAuthHeaders(extra = {}) {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
            ...extra
        };
    },

    async addSample(sample) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(sample),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка добавления образца:', errorText);
            throw new Error('Не удалось добавить образец');
        }

        const text = await response.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            return text;
        }
    },

    async getSampleList() {
        const response = await fetch(API_URL, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка получения списка образцов:', errorText);
            throw new Error('Не удалось получить образцы');
        }

        return await response.json();
    },

    async updateSample(id, updatedSample) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(updatedSample),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка обновления образца:', errorText);
            throw new Error('Не удалось обновить образец');
        }

        return await response.json();
    },

    async deleteSample(id, category) {
        const response = await fetch(`${API_URL}/${category}/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка удаления образца:', errorText);
            throw new Error('Не удалось удалить образец');
        }

        return true;
    },

    async uploadSampleFile(formData) {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: this.getAuthHeaders(), // Не указываем Content-Type для FormData
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка загрузки файла:', errorText);
            throw new Error('Не удалось загрузить файл');
        }

        return await response.json();
    },

    async saveAnalysisResults(analysisData) {
        const response = await fetch(`${API_URL}/analysis`, {
            method: 'POST',
            headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(analysisData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка сохранения анализа:', errorText);
            throw new Error('Не удалось сохранить результаты анализа');
        }

        return await response.json();
    },

    async generateProtocol(sampleId, category) {
        const response = await fetch(`${API_URL}/${category}/${sampleId}/protocol`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка генерации протокола:', errorText);
            throw new Error('Не удалось сформировать протокол');
        }

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = null;

        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;\n]*)/i);
            if (fileNameMatch?.[1]) {
                try {
                    fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''));
                } catch {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            }
        }

        const blob = await response.blob();
        return {
            data: blob,
            fileName
        };
    }
};

export default SampleService;
