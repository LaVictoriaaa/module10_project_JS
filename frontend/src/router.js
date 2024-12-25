import {Dashboard} from "./components/dashboard";
import {Login} from "./components/login";
import {SignUp} from "./components/sign-up";
import {getElement} from "bootstrap/js/src/util";

export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');

        this.initEvents();

        this.routes = [
            {
                route: '/',
                title: 'Главная страница',
                filePathTemplate: '/templates/dashboard.html', //путь до кусочка html
                useLayout: '/templates/layout.html',
                load: () => {
                    new Dashboard();
                }
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                useLayout: false,
            },
            {
                route: '/layout',
                title: 'Страница',
                filePathTemplate: '/templates/layout.html', //путь до кусочка html
                load: () => {
                }
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/sign-up.html',
                useLayout: false,
                load: () => {
                    new SignUp();
                }
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/login.html',
                useLayout: false,
                load: () => {
                    new Login();
                }
            },
            {
                route: '/logout',
            },
            {
                route: '/incomes',
                title: 'Страница категории доходов',
                filePathTemplate: '/templates/category-list.html',
                useLayout: '/templates/layout.html',
            },
            {
                route: '/incomes-edit',
                title: 'Страница категории доходов',
                filePathTemplate: '/templates/category-edit.html',
                useLayout: '/templates/layout.html',
            },
            {
                route: '/incomes-create',
                title: 'Страница категории доходов',
                filePathTemplate: '/templates/category-create.html',
                useLayout: '/templates/layout.html',
            },
            {
                route: '/expenses',
                title: 'Страница категории расходов',
                filePathTemplate: '/templates/category-list.html',
                useLayout: '/templates/layout.html',

            },
            {
                route: '/budget',
                title: 'Страница доходов и расходов',
                filePathTemplate: '/templates/budget.html',
                useLayout: '/templates/layout.html',

            },
            {
                route: '/budget-create',
                title: 'Страница создания дохода/расхода',
                filePathTemplate: '/templates/budget-create.html',
                useLayout: '/templates/layout.html',

            },
            {
                route: '/budget-edit',
                title: 'Страница редактирования дохода/расхода',
                filePathTemplate: '/templates/budget-edit.html',
                useLayout: '/templates/layout.html',

            },
        ]

    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        //чтобы у нас использовался контент класса Route, а не самого события 'DOMContentLoaded' мы добавляем .bind(this)
        //функцию мы не вызываем, а просто передаем
        window.addEventListener('popstate', this.activateRoute.bind(this));
        //вызываем если изменился url
        // document.addEventListener('click', this.clickHandler.bind(this));
        // //обрабатываем ЛЮБОЙ клик на странице и функцией проверяем ссылка это или нет, чтобы запретить
        // //браузеру переходить по ссылке загружая приложение с 0 + фиксируем контекст через .bind(this)
    }

    async activateRoute() {
        //history.pushState(data, title [, url]) Добавляет новый элемент в url без перезагрузки страницы
        //обновляем url-адрес вручную
        const currentRoute = window.location.pathname;

        const newRoute = this.routes.find(item => item.route === currentRoute);

        if (newRoute) {
            //на всякий случай проверяем есть ли title
            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title + ' | Lumincoin Finance ';
            }

            //проверяем есть ли у роута template
            if (newRoute.filePathTemplate) {
                if (newRoute.useLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    //    ищем в layout блок content-layout, в который будем вставлять остальные template
                    this.contentPageElement = document.getElementById('content-layout');
                } else {
                    this.contentPageElement = document.getElementById('content');
                }

                // получаем результат, читаем ответ и возвращаем как обычный текст
                this.contentPageElement.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }


            //проверяем, что есть load и там есть функция, если да, то вызываем ее
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

        } else {
            console.log('No route found;');
            window.location = '/404';
        }

    }


}