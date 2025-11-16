const API_URL = 'http://89.223.68.165:5005/api/users';

class AuthService {
    // Метод для регистрации пользователя
    async registerUser(credentials) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ← обязательно, иначе 401
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Регистрация не удалась');
            }

            const data = await response.json();

            return data.success; // или return true;
        } catch (error) {
            console.error('Registration failed:', error);
            return false;
        }
    }

    // Метод для входа пользователя
    async loginUser(credentials) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ошибка входа');
            }

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                return true;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    // Метод для выхода пользователя
    static logoutUser() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    // Метод для получения текущего пользователя
    async getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

export default AuthService;
