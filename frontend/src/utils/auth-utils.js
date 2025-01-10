import config from "../config/config";

export class AuthUtils {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    static setAuthInfo(accessToken = null, refreshToken = null, userInfo = null) {
        // сохраняем полученные токены и инфу о пользователе в localStorage
        if (accessToken) {
            localStorage.setItem(this.accessTokenKey, accessToken);
        }
        if (refreshToken) {
            localStorage.setItem(this.refreshTokenKey, refreshToken);
        }
        if (userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    static removeAuthInfo() {
        // удаляем полученные токены и инфу о пользователе в localStorage
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    //если нам нужно получить только один ключ, то используем функцию getAuthInfo
    static getAuthInfo(key = null) {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            }
        }
    }

    //запрашиваем и получаем обновленный RefreshToken
    static async updateRefreshToken() {
        let result = false;
        const refreshToken = this.getAuthInfo(this.refreshTokenKey);
        if (refreshToken) {
            const response = await fetch(config.api + '/refresh', {
                method: 'POST',
                //стандартные хэдеры для backend запросов
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            // получаем ответ в виде
            //{
            // "tokens": {
            //  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGl0bG9naWEucnUiLCJpYXQiOjE3MzYxNTczNDEsImV4cCI6MTczNjE2NDU0MX0.OEGMao_lqNf7jRUqXKZAVPLz-ds3jsk20S-9C3E6CRQ",
            //  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGl0bG9naWEucnUiLCJpYXQiOjE3MzYxNTczNDEsImV4cCI6MTczNjI0Mzc0MX0.9oqJa1ETW1o42C7gvsDwq0PhFvhFTBy3mVsqf03Ixq8"
            //  }
            // }

            if (response && response.status === 200) {
                //если ответ есть, то преобразовываем JSON
                const tokens = await response.json();
                if (tokens && !tokens.error) {
                    this.setAuthInfo(tokens.accessToken, tokens.refreshToken);
                    result = true;
                }
            }
        }

        if (!result) {
            this.removeAuthInfo();
        }

        return result;
    }

}