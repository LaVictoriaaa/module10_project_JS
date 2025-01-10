import moment from "moment";
import {HttpUtils} from "../utils/http-utils";
import {Chart} from "chart.js";

export class Dashboard {
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

        // this.showOperations(result.response);
    }

    showCharts () {

        // let myChart = new Chart(ctx, {
        //     type: 'bar',
        //     data: stars,
        //     backgroundColor: [
        //         "rgba(255, 99, 132, 0.2)",
        //         "rgba(54, 162, 235, 0.2)",
        //         "rgba(255, 206, 86, 0.2)",
        //         "rgba(75, 192, 192, 0.2)",
        //         "rgba(153, 102, 255, 0.2)"
        //     ]
        //     options: {
        //         maintainAspectRatio: false,
        //         responsive: false
        //     }
        // })

        // const configIncomes = {
        //     type: 'pie',
        //     data: data,
        //     options: {
        //         responsive: true,
        //         plugins: {
        //             legend: {
        //                 position: 'top',
        //             },
        //             title: {
        //                 display: true,
        //                 text: 'Chart.js Pie Chart'
        //             }
        //         }
        //     },
        // };


    }


}