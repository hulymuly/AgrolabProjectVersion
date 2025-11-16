import CultureService from '../services/CultureService';
// import MockCultureService from '../components/Mockups/MockCultureService';

const isTesting = false; // Моки отключены

const CultureRepository = {
    // Метод для получения культур
    async getCultures() {
        return await CultureService.fetchCultures();
    },

    // Метод для создания новой культуры
    async createCulture(culture) {
        return await CultureService.addCulture(culture);
    },

    // Метод для обновления существующей культуры по ID
    async updateCulture(oldCulture, newCulture) {
        const cultureId = typeof oldCulture === 'object' ? oldCulture.id : oldCulture;
        return await CultureService.updateCulture(cultureId, newCulture);
    },

    // Метод для получения культуры по имени
    async getCultureByName(cultureName) {
        const cultures = await CultureService.fetchCultures();

        return cultures.find(culture =>
            typeof culture === 'object'
                ? culture.name === cultureName
                : culture === cultureName
        );
    },

    // Метод для получения норм по культуре
    async getNormsByCulture(cultureName, category, reproduction) {
        const culture = await this.getCultureByName(cultureName);

        if (!culture || typeof culture !== 'object') {
            return null;
        }

        const reproductionMap = {
            'ОС - оригинальная': 'original',
            'ЭС - элитная': 'elite',
            'РС - 1 репродукция': 'first',
            'РСт - 2 репродукция': 'second'
        };

        const reproductionKey = reproductionMap[reproduction] || reproduction;

        if (category === 'seeds' && culture.seedNorms) {
            return culture.seedNorms[reproductionKey] || null;
        } else if (category === 'potatoes' && culture.potatoNorms) {
            return culture.potatoNorms[reproductionKey] || null;
        }

        return null;
    },

    // Метод для удаления культуры по ID
    async deleteCulture(culture) {
        const cultureId = typeof culture === 'object' ? culture.id : culture;
        return await CultureService.deleteCulture(cultureId);
    }
};

export default CultureRepository;
