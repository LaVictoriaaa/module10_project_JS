import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        //проверяем есть ли accessToken, если есть, то возвращаем на страница дашборда '/'
        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.remeberMeElement = document.getElementById('remember-me');


        document.getElementById('process-button').addEventListener('click', this.login.bind(this));
        //фиксируем контекст, чтобы он не терялся
    }

    validateForm() {

        let isValid = true;
        //добавляем переменную, кот. будет возвращать функция, для того, чтобы в ф-ии login можно было
        //проверить валидна форма или нет

        if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
            //     if (this.emailElement.value && this.emailElement.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            this.emailElement.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.emailElement.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

        if (this.passwordElement.value) {
            this.passwordElement.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.passwordElement.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

        return isValid;
    }

    async login() {
        if (this.validateForm()) { //отправка запроса с новыми данными

            const result = await HttpUtils.request('/login', 'POST', {
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: this.remeberMeElement.checked
            });

            // в ответ получаем это
            // {
            //     "tokens": {
            //     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGl0bG9naWEucnUiLCJpYXQiOjE3MDUyNDExMTgsImV4cCI6MTcwNTI0MjAxOH0.CcK-9r4TU4757UkyGNiIdCoInkZXCRQ_-HY8kMiyTE8",
            //         "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGl0bG9naWEucnUiLCJpYXQiOjE3MDUyNDExMTgsImV4cCI6MTcwNTMyNzUxOH0.FO_5hFqwA37vI-oRv1TV4NkbVUwTvKYMCVeL0So-B28"
            // },
            //     "user": {
            //     "name": "Пользователь",
            //     "lastName": "Айтилогии",
            //     "id": 1
            // }
            // }


            console.log(result);

            //проверяем была ли ошибка или не было ответа или был ответ и отсутствовало одно из полей
            if (result.error || !result.response || (result.response && (!result.response.tokens || !result.response.user))) {
                //проверяем проходят ли все необходимые поля
                throw new Error(result.message);
                // return;
            }

            // сохраняем полученные токены и инфу о пользователе в localStorage
            AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {
                name: result.response.user.name,
                lastName: result.response.user.lastName,
                id: result.response.user.id
            });


            // //window.location.href = "/"; - такой подход мы не можем использовать, потому что это
            // будет собирать приложение заново, т.е. производить полноценный редирект. Для избегания этого нужно
            // использовать ф-ию openNewRoute из router.js
            this.openNewRoute('/');

        }
    }

}