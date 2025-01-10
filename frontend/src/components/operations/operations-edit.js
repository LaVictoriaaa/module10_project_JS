import {HttpUtils} from "../../utils/http-utils";

export class OperationsEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.currentRoute = window.location.pathname; // /operations/edit
        this.operationsLink = window.location.pathname.split('/')[1];
        //строка делится на массив из трех элементов ['', 'operations', 'edit']
        console.log(this.operationsLink);

        const urlParams = new URLSearchParams(window.location.search);
        // часть адреса после символа ?, включая символ ?
        this.id = urlParams.get('id'); //получаем айдишник

        console.log(this.id)

        if (!this.id) {
            return this.openNewRoute('/');
        }

        this.operationType = document.getElementById('operation-type');
        this.operationCategory = document.getElementById('operation-category');
        this.operationSum = document.getElementById('operation-sum');
        this.operationDate = document.getElementById('operation-date');
        this.operationComment = document.getElementById('operation-comment');

        //если нажимаем кнопку сохранить
        document.getElementById('update-button').addEventListener('click', this.updateOperation.bind(this));

        //если нажимаем кнопку отмена
        document.getElementById('cancel-button').addEventListener('click', this.returnBack.bind(this));

        this.getOperation(this.id).then();
    }

    async getOperation(id) {
        const result = await HttpUtils.request('/operations/' + id, 'GET', true);

        console.log(result);

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        // проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
        if (result.error || !result.response) {
            return alert('Возникла ошибка при запросе операции. Обратитесь в поддержку!');
        }

        this.operationOriginalData = result.response; //сохраняем данные с бека, которые мы
        // получили сразу при открытии страницы
        console.log(this.operationOriginalData);

        this.showOperation(result.response);
    }

    showOperation(operation) {
        //получаем ответ в виде
        // { amount: 709
        // category: "Зарплата"
        // comment: "Нет"
        // date: "2025-01-02"
        // id: 11
        // type: "income" }

        if (operation.type === "income") {
            this.operationType.value = "Доход";
            operation.type = "income"
        } else if (operation.type === "expense") {
            this.operationType.value = "Расход";
            operation.type = "expense"
        } else {
            this.operationType.value = "Произошла ошибка при запросе";
        }

        this.operationCategory.value = operation.category;
        this.operationSum.value = operation.amount;
        this.operationDate.value = operation.date;
        this.operationComment.value = operation.comment;

    }

    validateOperationData() {
        let isValid = true;
        //добавляем переменную, кот. будет возвращать функция, для того, чтобы в ф-ии saveCategory можно было
        //проверить валидна форма или нет


        if (this.operationType.value === "Доход" || this.operationType.value === "Расход") {
            console.log('Все верно');
            this.operationType.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.operationType.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

        if (this.operationCategory.value && this.operationCategory.value.match(/^(?!\s*$)[А-Яа-яЁё0-9а-яёА-Я\s]+$/)) {
            //ввод одного или нескольких слов на русском языке, а также чтобы слово не начиналось с пробела
            this.operationCategory.nextElementSibling.classList.add('invalid-feedback');
        } else {
            this.operationCategory.nextElementSibling.classList.remove('invalid-feedback');
            isValid = false;
        }

        return isValid;
    }


    async updateOperation(e) {
        e.preventDefault();
        let typeOfOperation = null;


        if (this.validateOperationData()) {
            const changedData = {}; //создаем объект с измененными данными, вначале он пустой
            //получаем ответ в виде
            // { amount: 709
            // category: "Зарплата"
            // comment: "Нет"
            // date: "2025-01-02"
            // id: 11
            // type: "income" }

            if (this.operationType.value === "Доход") {
                typeOfOperation = "income";
            } else if (this.operationType.value === "Расход") {
                typeOfOperation = "expense";
            }

            console.log(typeOfOperation);

            if (typeOfOperation !== this.operationOriginalData.type) {
                changedData.type = this.operationOriginalData.type; //если данные не совпадают, то сохраняем в объект новые
                // введенные данные
            }

            if (this.operationCategory.value !== this.operationOriginalData.category) {
                changedData.category = this.operationCategory.value;
            }

            if (this.operationSum.value !== this.operationOriginalData.amount) {
                changedData.amount = this.operationSum.value;
            }

            if (this.operationDate.value !== this.operationOriginalData.date) {
                changedData.date = this.operationDate.value;
            }

            if (this.operationComment.value !== this.operationOriginalData.comment) {
                changedData.comment = this.operationComment.value;
            }

            // "type": "expense",
            //     "amount": 150,
            //     "date": "2022-02-02",
            //     "comment": "wtf",
            //     "category_id": 3

            if (Object.keys(changedData).length > 0) {//если есть хотя бы один ключ, то длина массива будет больше 0
                //Метод Object.keys возвращает массив строковых элементов, соответствующих именам
                // перечисляемых свойств, найденных непосредственно в самом объекте.
                const result = await HttpUtils.request('/operations/' + this.id, 'PUT', true, changedData);
                //запрос уходит на http://localhost:3000/api/operations/2

                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                //проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
                if (result.error || !result.response || (result.response && result.response.error)) {
                    if (result.response.message === 'This record already exists') {
                        return alert('Операция с таким названием уже существует! Введите новую');
                    }
                    return alert('Возникла ошибка при изменении операции. Обратитесь в поддержку!');
                }

                return this.openNewRoute('/' + this.operationsLink);
            }
        }
    }

    returnBack(e) {
        e.preventDefault();

        return this.openNewRoute('/' + this.operationsLink);
    }
}