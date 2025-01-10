import {HttpUtils} from "../../utils/http-utils";

export class CategoryEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.title = document.getElementById('category-title');
        this.currentRoute = window.location.pathname;

        this.currentCategoriesType = window.location.pathname.split('/')[1];
        //строка делится на массив из трех элементов, нам нужен 1-ый
        //['', 'expenses', 'create']
        //['', 'incomes', 'create']

        this.currentCategory = this.currentCategoriesType.slice(0, -1);
        this.categoryName = document.getElementById('category-name');

        const urlParams = new URLSearchParams(window.location.search);
        // часть адреса после символа ?, включая символ ?
        const id = urlParams.get('id'); //получаем айдишник

        if (!id) {
            return this.openNewRoute('/');
        }

        if (this.currentCategoriesType === 'incomes') {
            this.title.innerText = 'Редактирование категории доходов';

        } else if (this.currentCategoriesType === 'expenses') {
            this.title.innerText = 'Редактирование категории расходов';

        }

        //если нажимаем кнопку сохранить
        document.getElementById('update-button').addEventListener('click', this.updateCategory.bind(this));

        //если нажимаем кнопку отмена
        document.getElementById('cancel-button').addEventListener('click', this.returnBack.bind(this));


        this.getCategory(id).then();
    }

    async getCategory(id) {
        const result = await HttpUtils.request('/categories/' + this.currentCategory + '/' + id, 'GET', true);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        // если ошибка
        // {
        //   "error": true,
        //   "message": "jwt expired"
        // }

        // проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
        if (result.error || !result.response) {
            return alert('Возникла ошибка при запросе категории. Обратитесь в поддержку!');
        }

        this.categoryOriginalData = result.response; //сохраняем данные с бека, которые мы
        // получили сразу при открытии страницы
        console.log(this.categoryOriginalData);
        this.showCategory(result.response);
    }

    showCategory(category) {
        // Получаем ответ в виде
        // {
        //     "id": 1,
        //     "title": "Депозиты"
        // }

        this.categoryName.value = category.title;

    }

    validateCategoryName() {
        let isValid = true;
        //добавляем переменную, кот. будет возвращать функция, для того, чтобы в ф-ии saveCategory можно было
        //проверить валидна форма или нет


        if (this.categoryName.value && this.categoryName.value.match(/^(?!\s*$)[А-Яа-яЁё0-9а-яёА-Я\s]+$/)) {
            //ввод одного или нескольких слов на русском языке, а также чтобы слово не начиналось с пробела
            this.categoryName.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.categoryName.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

        return isValid;
    }


    async updateCategory(e) {
        e.preventDefault();

        if (this.validateCategoryName()) {
            const changedData = {}; //создаем объект с измененными данными, вначале он пустой

            if (this.categoryName.value !== this.categoryOriginalData.title) {
                changedData.title = this.categoryName.value; //если данные не совпадают, то сохраняем в объект новые
                // введенные данные
            }

            if (Object.keys(changedData).length > 0) {//если есть хотя бы один ключ, то длина массива будет больше 0
                //Метод Object.keys возвращает массив строковых элементов, соответствующих именам
                // перечисляемых свойств, найденных непосредственно в самом объекте.
                const result = await HttpUtils.request('/categories/' + this.currentCategory + '/' + this.categoryOriginalData.id, 'PUT', true, changedData);
                //запрос уходит на http://localhost:3000/api/categories/income/1 или expense без буквы s

                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                //проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
                if (result.error || !result.response || (result.response && result.response.error)) {
                    if (result.response.message === 'This record already exists') {
                        return alert('Категория с таким названием уже существует! Введите новую');
                    }
                    return alert('Возникла ошибка при изменении категории. Обратитесь в поддержку!');
                }

                return this.openNewRoute('/' + this.currentCategoriesType);
            }
        }
    }

    returnBack(e) {
        e.preventDefault();

        return this.openNewRoute('/' + this.currentCategoriesType);
    }
}