import config from "../config/config";
import {AuthUtils} from "./auth-utils";

export class HttpUtils {
    static async request(url, method = "GET", useAuth = true, body = null) {
        const result = {
            error: false,
            response: null //result у нас изначально null и если будет ошибка, то в result так и останется null
        };

        // формируем объект
        const params = {
            method: method,
            //стандартные хэдеры для backend запросов
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            },
        };

        //получаем token
        let token = null;

        if (useAuth) {
            token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
            if (token) {
                params.headers['x-auth-token'] = token;
            }
        }

        //проверяем есть ли body (он присутствует при POST-запросах)
        if (body) {
            // if you are making a post, put or patch request,
            // you have to stringify your data with body: JSON.stringify(data)
            // body: JSON.stringify( )
            params.body = JSON.stringify(body);
        }


        //отлавливаем ошибки
        let response = null;
        try {
            //осуществляем запрос
            response = await fetch(config.api + url, params)
            //получаем результат от сервера и переводим в JSON
            result.response = await response.json();
        } catch (e) {
            result.error = true;
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true;
            //обрабатываем ошибку если нет токена (зашли с другого браузера или открыли
            // из вкладок и в localStorage токена нет) или он старый
            if (useAuth && response.status === 401) {
                if (!token) {
                    //1 - токена нет
                    result.redirect = '/login';
                    // console.log('1 - токена нет');
                } else {
                    //2 - токен устарел/невалидный (надо обновить)
                    const updateTokenResult = await AuthUtils.updateRefreshToken();
                    if (updateTokenResult) {
                        //если удалось получить refreshToken, то делаем запрос повторно
                        return this.request(url, method, useAuth, body);
                    } else {
                        console.log('2 - токен устарел/невалидный (надо обновить)');

                        result.redirect = '/login';
                    }
                }
            }
        }

        return result;

    }
}