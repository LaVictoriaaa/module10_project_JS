import {Dashboard} from "./components/dashboard";
import {Login} from "./components/login";
import {SignUp} from "./components/sign-up";
import {getElement} from "bootstrap/js/src/util";
import {Logout} from "./components/logout";

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
                    new SignUp(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/login.html',
                useLayout: false,
                load: () => {
                    new Login(this.openNewRoute.bind(this));
                    //передаем как параметр ф-ию openNewRoute, но нам крайне важно, чтобы
                    // в ф-ии остался контекст класса Route, поэтому используем bind
                }
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                }
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
        document.addEventListener('click', this.clickHandler.bind(this));
        //обрабатываем ЛЮБОЙ клик на странице и функцией проверяем ссылка это или нет, чтобы запретить
        //браузеру переходить по ссылке загружая приложение с 0 + фиксируем контекст через .bind(this)
    }

    async openNewRoute(url) { //тот роут, который будем сейчас открывать
        //history.pushState(data, title [, url]) Добавляет новый элемент в url без перезагрузки страницы
        //обновляем url-адрес вручную
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        //сюда могут попадать как url, так и event (из функции  initEvents()), поэтому лучше сделать 2 параметра
        await this.activateRoute(null, currentRoute);

    }

    async clickHandler(e) {
        //обрабатываем элемент по клику
        let element = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }

        //если элемент нашелся, то берем из него url-адрес
        if (element) {
            e.preventDefault();

            const currentRoute = window.location.pathname;

            const url = element.href.replace(window.location.origin, '');
            // заменяем http://localhost:9001/login => window.location.origin → 'http://localhost:9001' на пустоту
            // если это не ссылки с url'ами, то мы останавливаем выполнение функции, т.к. нас такие клики не интересуют
            // if (!url || url === '/#' || url.startsWith('javascript:void(0)')) { - такой код
            // был ранее, сейчас мы добавили (currentRoute === url.replace('#', '')), потому что
            // при нажатии на страницы в фрилансерах в роут добавляется решетка freelancers# и код
            // не работает, а с такой модификацией мы проверяем соответствует ли новый роут текущему, но без решетки
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }

            //и вызываем нужные действия, чтобы сменить страницу БЕЗ перезагрузки и сборки заново
            await this.openNewRoute(url);
        }

    }


    async activateRoute(e, oldRoute = null) {
        // async activateRoute() {
        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);

            //удаляем стили у предыдущего роута
            if (currentRoute.styles && currentRoute.styles.length > 0) {
                currentRoute.styles.forEach(style => {
                    document.querySelector(`link[href='/css/${style}']`).remove();
                });
            }

            //удаляем скрипты у предыдущего роута
            if (currentRoute.scripts && currentRoute.scripts.length > 0) {
                currentRoute.scripts.forEach(script => {
                    document.querySelector(`script[src='/js/${script}']`).remove();
                });
            }

            if (currentRoute.unload && typeof currentRoute.unload === 'function') {
                currentRoute.unload();
            }
        }

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            //на всякий случай проверяем есть ли title
            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title + ' | Lumincoin Finance ';
            }

            //проверяем есть ли у роута template
            if (newRoute.filePathTemplate) {

                //проверяем на наличие layout'а
                let contentBlock = this.contentPageElement;

                if (newRoute.useLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    //    ищем в layout блок content-layout, в который будем вставлять остальные template
                    contentBlock = document.getElementById('content-layout');

                    // this.contentPageElement = document.getElementById('content-layout');
                } else {
                    this.contentPageElement = document.getElementById('content');
                }

                // получаем результат, читаем ответ и возвращаем как обычный текст
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }


            //проверяем, что есть load и там есть функция, если да, то вызываем ее
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

        } else {
            console.log('No route found;');
            history.pushState({}, '', '/404');
            await this.activateRoute();
            //т.к. это SPA, то теперь подставлять значения в url через window.location мы не можем.
            // Используя window.location, мы говорим браузеру открыть нам новую страницу на сервере.
            // window.location = '/404';
            // //после того, как переводим пользователя на другую страницу, то никаких действий не осуществляем
            // //можно еще добавлять return чтобы обезопасить от багов или сжирания ресурсов
        }

    }


}