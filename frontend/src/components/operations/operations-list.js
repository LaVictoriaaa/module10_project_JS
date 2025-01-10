import moment from "moment/moment";
import {HttpUtils} from "../../utils/http-utils";


export class OperationsList {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute; //получаем openNewRoute
        this.currentRoute = window.location.pathname;
        console.log(this.currentRoute); // /operations

        this.id = window.location.pathname.split('/')[1];
        //строка делится на массив из трех элементов, нам нужен 1-ый
        //['', 'expenses', 'create']
        //['', 'incomes', 'create']
        console.log(this.id);  // operations

        this.currentCategory = this.id.slice(0, -1);
        console.log(this.currentCategory);// operation

        const today = document.getElementById('today'); // на бэке string '--'
        const week = document.getElementById('week'); // на бэке string 'week'
        const month = document.getElementById('month'); // на бэке string 'month'
        const year = document.getElementById('year'); // на бэке string 'year'
        const all = document.getElementById('all-periods'); // на бэке string 'all'
        const interval = document.getElementById('interval'); // на бэке string 'interval' и тогда нужны dateFrom и dateTo
        const allBtns = document.querySelectorAll('.filter-buttons');

        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth() + 1;
        let currentDay = currentDate.getDate();

        let currentMilliseconds = currentDate.getTime();
        const sevenDays = 604800000;
        const oneMonth = 2592000000;

        // если месяц меньше 10, от 1 до 9, то перед цифрой добавляем 0
        if (currentMonth < 10) {
            currentMonth = '0' + currentMonth;
        }

        // если месяц меньше 10, от 1 до 9, то перед цифрой добавляем 0
        if (currentDay < 10) {
            currentDay = '0' + currentDay;
        }

        let now = currentYear + '-' + currentMonth + '-' + currentDay;
        let lastYear = currentYear - 1 + '-' + currentMonth + '-' + currentDay;

        // console.log(now)

        function deleteActiveClass(btn) {
            for (let i = 0; i < allBtns.length; i++) {
                if (allBtns[i].classList.contains('active')) {
                    allBtns[i].classList.remove("active");
                }
            }
            btn.classList.add('active');
        }

        this.getOperations(this, 'all').then();


        today.onclick = () => {
            deleteActiveClass(today);
            console.log(now);
            this.getOperations(this, 'today', now, now).then();

        };

        week.onclick = () => {
            deleteActiveClass(week);
            let weekAgo = new Date(currentMilliseconds - sevenDays).toLocaleString();
            console.log(weekAgo);

            this.getOperations(this, 'week', weekAgo, weekAgo).then();
        };

        month.onclick = () => {
            deleteActiveClass(month);
            let monthAgo = new Date(currentMilliseconds - oneMonth).toLocaleString();
            console.log(monthAgo);

            this.getOperations(this, 'month').then();
        };

        year.onclick = () => {
            deleteActiveClass(year);

            console.log(lastYear)
            this.getOperations(this, 'year', lastYear, now).then();
        };

        all.onclick = () => {
            deleteActiveClass(all);
            this.getOperations(this, 'all').then();
        };

        interval.onclick = () => {
            deleteActiveClass(interval);

            let from = document.getElementById('date-from').value;
            let to = document.getElementById('date-to').value;
            let dateFrom = moment(from, 'DD.MM.YYYY', true).format('YYYY-MM-DD');
            let dateTo = moment(to, 'DD.MM.YYYY', true).format('YYYY-MM-DD');

            if (from || to) {
                if (dateFrom === 'Invalid date' || dateTo === 'Invalid date') {
                    alert('Введите даты в формате ДД.ММ.ГГГГ! Обязательно разделяя цифры точкой');
                }
                console.log(from);
                console.log(dateFrom);
                console.log(to);
                console.log(dateTo);

                this.getOperations(this, 'interval', dateFrom, dateTo).then();

            } else {
                alert('Введите даты интервалов в формате ДД.ММ.ГГГГ! Обязательно разделяя цифры точкой');
            }
        };
    }

    async getOperations(that, period, from = null, to = null) {
        const result = await HttpUtils.request('/operations?period=' + period + '&dateFrom=' + from + '&dateTo=' + to, 'GET', true);
        //запрос уходит как
        // http://localhost:3000/api/operations?period=interval&dateFrom=2022-09-12&dateTo=2022-09-13

        // в ответ получаем
        //[
        //   {
        //     "id": 3,
        //     "type": "expense",
        //     "amount": 250,
        //     "date": "2022-09-13",
        //     "comment": "Оплата квартиры 2",
        //     "category": "Жилье"
        //   },
        //   {
        //     "id": 2,
        //     "type": "expense",
        //     "amount": 2500,
        //     "date": "2022-09-12",
        //     "comment": "Оплата квартиры",
        //     "category": "Жилье"
        //   }
        // ]
        console.log(result);
        //result выглядит так = {error: false, response: Array(7)}
        console.log(result.response);
        //result.response выглядит так = [
        // {id: 3, type: 'expense', amount: 250, date: '2022-09-13', comment: 'Оплата квартиры 2', …}
        // {id: 2, type: 'expense', amount: 2500, date: '2022-09-12', comment: 'Оплата квартиры', …}
        // {id: 1, type: 'income', amount: 50000, date: '2022-09-11', comment: 'ЗП', …}
        // {id: 6, type: 'expense', amount: 2100, date: '2022-09-05', comment: 'Стоматолог', …}
        // {id: 4, type: 'expense', amount: 2400, date: '2022-08-10', comment: 'Оплата квартиры', …}
        // {id: 5, type: 'expense', amount: 400, date: '2022-07-10', comment: 'Оплата квартиры', …}
        // {id: 7, type: 'expense', amount: 6000, date: '2022-04-03', comment: 'Стоматолог', …}
        // ]

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        // Получаем ответ в виде [
        // { "id": 1, "title": "Депозиты" },
        // { "id": 2, "title": "Зарплата" },
        // { "id": 3, "title": "Сбережения" },
        // { "id": 4, "title": "Инвестиции" }
        // ]

        // проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
        if (result.response.error || !result.response) {
            console.log(result.response.error);
            return alert('Возникла ошибка при запросе категории. Обратитесь в поддержку!');
        }

        this.showOperations(result.response);
    }

    showOperations(operations) {
        const recordsElement = document.getElementById('records');
        recordsElement.innerHTML = ''; //каждый раз перед нажатием очищаем таблицу


        if (!operations || !operations.length) {
            alert('За данный период данные отсутствуют');
        }

        for (let i = 0; i < operations.length; i++) {
            //    Мы создали элемент, но пока он только в переменной. Мы не можем видеть его на странице,
            //    поскольку он не является частью документа
            const trElement = document.createElement('tr');

            //    insertCell() метод вставляет ячейку в текущей строке
            trElement.insertCell().innerText = i + 1; //вставляем порядковый номер начиная с 1

            if (operations[i].type === 'income') {
                trElement.insertCell().innerHTML = '<span class="text-success">доход</span>';
            } else if (operations[i].type === 'expense') {
                trElement.insertCell().innerHTML = '<span class="text-danger">расход</span>';
            }

            trElement.insertCell().innerText = operations[i].category;
            trElement.insertCell().innerText = new Intl.NumberFormat('ru-RU').format(operations[i].amount) + ' $'; //Объект Intl.NumberFormat является конструктором объектов, включающих языко-зависимое форматирование чисел.
            trElement.insertCell().innerText = moment(operations[i].date, 'YYYY-MM-DD', true).format('DD.MM.YYYY'); // меняем формат обратно

            if (operations[i].comment.length > 0) {
                trElement.insertCell().innerText = operations[i].comment;
            } else {
                trElement.insertCell().innerText = " ";
            }

            const icons =`<div class="d-flex gap-2 justify-content-end">
            <button id="${operations[i].id}" class="border-0 bg-transparent px-0 delete-button">
            <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"></path> <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"></path>
            <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z"  fill="black"></path>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z"  fill="black"></path></svg>
            </button>
            <a href="/operations/edit?id=${operations[i].id}" id="${operations[i].id}" class="border-0 bg-transparent px-0 delete-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> 
            <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"></path>
            </svg>
            </a>
            </div>`;
            trElement.insertCell().innerHTML = icons;



            recordsElement.appendChild(trElement);
        }

        this.pressDeleteButton();
    }

    pressDeleteButton() {
        const popup = document.getElementById('popup');

        document.querySelectorAll('.delete-button').forEach(item => {
            item.onclick = () => { // Используем стрелочную функцию
                popup.classList.add('show');

                // если нажимаем кнопку отмена
                document.getElementById('cancel-button').onclick = (e) => {
                    popup.classList.remove('show');
                };

                // если нажимаем кнопку сохранить с использованием стрелочной функции
                document.getElementById('delete-button').onclick = async () => {
                    await this.deleteCategory(item.id); // Ждем выполнения deleteCategory
                    console.log(item.id);
                    popup.classList.remove('show'); // Закрываем попап после удаления
                };
            };
        });
    }

    async deleteCategory(id) {
        const result = await HttpUtils.request('/operations/' + id, 'DELETE', true);

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        //проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при удалении категории. Обратитесь в поддержку!');
        }

        return this.openNewRoute('/operations');
    }
}