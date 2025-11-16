import AuthService from '../services/AuthService';
import ReagentRepository from '../Repository/ReagentRepository'
import authService from "../services/AuthService";

class AuthRepository {
    // Метод для регистрации пользователя
    async registerUser(credentials) {
        // Вызов API для регистрации пользователя
        var authService = new AuthService();
        const result = await authService.registerUser(credentials);
        if(result){
            const reagents = await ReagentRepository.fetchReagents();
            this.checkExpiryDates(reagents);
            return true;
        }
        return false;
    }

    // Метод для входа пользователя
    async loginUser(credentials) {
        // Вызов API для входа пользователя
        var authService = new AuthService();
        const result = await authService.loginUser(credentials)??false;
        return result;
    }

    // Метод для выхода пользователя
    async logoutUser() {
        // Вызов API для выхода пользователя
        return AuthService.logoutUser();
    }

    // Метод для получения информации о пользователе
    async getUser() {
        // Получение пользователя из локального хранилища
        var authService = new AuthService();
        return authService.getUser();
    }

    // Метод для проверки сроков годности реагентов
    checkExpiryDates = (reagents) => {
        const today = new Date();
        reagents.forEach(reagent => {
            const expiryDate = new Date(reagent.expiryDate);
            if (expiryDate < today) {
                alert(`Срок годности реагента "${reagent.name}" истек!`);
            } else if (expiryDate - today <= 7 * 24 * 60 * 60 * 1000) { // Если срок годности истекает в течение недели
                alert(`Срок годности реагента "${reagent.name}" истекает через ${Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))} дней!`);
            }
        });
    };
}

export default AuthRepository;
