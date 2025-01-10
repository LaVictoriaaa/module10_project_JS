import {HttpUtils} from "../../utils/http-utils";

export class OperationsCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.title = document.getElementById('category-title');
        this.currentCategoriesType = window.location.pathname.split('/')[1];
        //строка делится на массив из трех элементов, нам нужен 1-ый
        // получили ['', 'operations', 'create']

        this.categoryType = document.getElementById('category-type');
        this.categoryError = document.getElementById('category-type-error');
        this.categoryFamily = document.getElementById('category-family');
        this.categorySum = document.getElementById('category-sum');
        this.categoryDate = document.getElementById('category-date');
        this.categoryComment = document.getElementById('category-comment');
        this.categoryId = null;

        // отправляем эти данные на бэк
        // {
        //   "type": "income",
        //   "amount": 250,
        //   "date": "2022-01-01",
        //   "comment": "new comment",
        //   "category_id": 2
        // }

        // получаем ответ
        //{
        //   "id": 5,
        //   "type": "income",
        //   "amount": 250,
        //   "date": "2022-01-01",
        //   "comment": "new comment",
        //   "category": "Зарплата"
        // }

        //если нажимаем кнопку сохранить
        document.getElementById('save-button').addEventListener('click', this.saveOperations.bind(this));

        //если нажимаем кнопку отмена
        document.getElementById('cancel-button').addEventListener('click', this.returnBack.bind(this));
    }

    validateOperations() {
        let isValid = true;
        //добавляем переменную, кот. будет возвращать функция, для того, чтобы в ф-ии saveCategory можно было
        //проверить валидна форма или нет

        if (this.categoryType.value === 'income') {
            this.categoryId = 2;
            this.categoryError.classList.add('invalid-feedback');
        } else if (this.categoryType.value === 'expense'){
            this.categoryId = 1;
            this.categoryError.classList.add('invalid-feedback');
        } else {
            this.categoryError.classList.remove('invalid-feedback');
            isValid = false;
        }

        console.log('categoryId=' + this.categoryId);


        this.categoryType.addEventListener('click',() => {
            console.log(this.categoryType.value);
            if (this.categoryId === 2) {
                // this.categoryFamily.innerHTML = "Категория доходов";
                this.categoryFamily.innerHTML = `<option selected disabled> Категория доходов</option>`;
            } else if (this.categoryId === 1) {
                // this.categoryFamily.innerHTML = "Категория расходов";
                this.categoryFamily.innerHTML = `<option selected disabled> Категория расходов</option>`;
            } else {
                this.categoryFamily.nextElementSibling.classList.remove('invalid-feedback');
            }
        })

        if (this.categorySum.value) {
            this.categorySum.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.categorySum.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

        if (this.categoryDate.value) {
            this.categoryDate.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.categoryDate.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    async saveOperations(e) {
        e.preventDefault();


        if (this.validateOperations()) {
            const createData = {
                type: this.categoryType.value,
                amount: this.categorySum.value,
                date: this.categoryDate.value,
                comment: this.categoryComment.value,
                category_id: this.categoryId
            };

            console.log(createData);

            const result = await HttpUtils.request('/operations', 'POST', true, createData);
            //запрос уходит на http://localhost:3000/api/categories/income или expense без буквы s

            console.log(result);

            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            //проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
            if (result.error || !result.response || (result.response && result.response.error)) {
                if (result.response.message === 'This record already exists') {
                    return alert('Операция с таким названием уже существует! Введите новую');
                }
                return alert('Возникла ошибка при добавлении операции. Обратитесь в поддержку!');
            }

            return this.openNewRoute('/'+ this.currentCategoriesType);
        }
    }



    returnBack(e) {
        e.preventDefault();
        return this.openNewRoute('/'+ this.currentCategoriesType);
    }
}