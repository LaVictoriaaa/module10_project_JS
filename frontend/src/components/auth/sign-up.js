import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";

export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        //проверяем есть ли accessToken, если есть, то возвращаем на страница дашборда '/'
        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.fullNameElement = document.getElementById('full-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');


        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
        //фиксируем контекст, чтобы он не терялся
    }

    validateForm() {

        let isValid = true;
        //добавляем переменную, кот. будет возвращать функция, для того, чтобы в ф-ии login можно было
        //проверить валидна форма или нет

        if (this.fullNameElement.value && this.fullNameElement.value.match(/^[A-ЯЁ][а-яё]+\s[A-ЯЁ][а-яё]+$/)) {
            this.fullNameElement.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.fullNameElement.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

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

        if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
            this.passwordRepeatElement.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.passwordRepeatElement.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

        return isValid;
    }

    async signUp() {

        if (this.validateForm()) {

            const result = await HttpUtils.request('/signup', 'POST', false, {
                name: this.fullNameElement.value.split(' ')[0],
                lastName: this.fullNameElement.value.split(' ')[1],
                email: this.emailElement.value,
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value
            });

            console.log(result);

            //проверяем была ли ошибка или не было ответа или был ответ и отсутствовало одно из полей
            if (!result.response.user) {
                //проверяем проходят ли все необходимые поля
                throw new Error(result.message);
                // return;
            }

            AuthUtils.setAuthInfo(null, null, {
                id: result.response.user.id,
                email: result.response.user.email,
                name: result.response.user.name,
                lastName: result.response.user.lastName
            });

            // localStorage.setItem('userInfo', JSON.stringify({
            //     id: result.user.id,
            //     email: result.user.email,
            //     name: result.user.name,
            //     lastName: result.user.lastName
            // }));

            this.openNewRoute('/login');

        }

    }


}