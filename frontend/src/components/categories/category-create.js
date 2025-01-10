import {HttpUtils} from "../../utils/http-utils";

export class CategoryCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.title = document.getElementById('category-title');
        this.currentCategoriesType = window.location.pathname.split('/')[1];
        //строка делится на массив из трех элементов, нам нужен 1-ый
        //['', 'expenses', 'create']
        //['', 'incomes', 'create']

        this.currentCategory = this.currentCategoriesType.slice(0, -1);
        this.categoryName = document.getElementById('category-name');

        // console.log(this.currentCategory)

        if (this.currentCategoriesType === 'incomes') {
            this.title.innerText = 'Создание категории доходов';

        } else if (this.currentCategoriesType === 'expenses') {
            this.title.innerText = 'Создание категории расходов';

        }

        //если нажимаем кнопку сохранить
        document.getElementById('save-button').addEventListener('click', this.saveCategory.bind(this));

        //если нажимаем кнопку отмена
        document.getElementById('cancel-button').addEventListener('click', this.returnBack.bind(this));

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

    async saveCategory(e) {
        e.preventDefault();

        if (this.validateCategoryName()) {

            const createData = {
                title: this.categoryName.value,
            };

            const result = await HttpUtils.request('/categories/' + this.currentCategory, 'POST', true, createData);
            //запрос уходит на http://localhost:3000/api/categories/income или expense без буквы s
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            //проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
            if (result.error || !result.response || (result.response && result.response.error)) {
                if (result.response.message === 'This record already exists') {
                    return alert('Категория с таким названием уже существует! Введите новую');
                }
                return alert('Возникла ошибка при добавлении категории. Обратитесь в поддержку!');
            }

            return this.openNewRoute('/'+ this.currentCategoriesType);
        }
    }

    returnBack(e) {
        e.preventDefault();

        return this.openNewRoute('/'+ this.currentCategoriesType);
    }
}