import {HttpUtils} from "../../utils/http-utils";

export class CategoryList {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute; //получаем openNewRoute
        this.title = document.getElementById('category-title');
        this.currentRoute = window.location.pathname;

        this.currentCategoriesType = window.location.pathname.split('/')[1];
        //строка делится на массив из трех элементов, нам нужен 1-ый
        //['', 'expenses', 'create']
        //['', 'incomes', 'create']

        this.currentCategory = this.currentCategoriesType.slice(0, -1);

        this.init();
    }

    init() {
        if (this.currentRoute === '/incomes') {
            this.title.innerText = 'Доходы';
            this.getCategories('/income').then();

        } else if (this.currentRoute === '/expenses') {
            this.title.innerText = 'Расходы';
            this.getCategories('/expense').then();
        }


    }

    async getCategories(typeCategory) {
        const result = await HttpUtils.request('/categories' + typeCategory, 'GET', true);

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

        // console.log(result);

        this.showCategories(result.response, typeCategory);
    }

    showCategories(categories, typeCategory) {
        //добавляем s, потому что в typeCategory у нас /income или /expense
        this.typeCategory = typeCategory + 's';

        let categoriesWrapElement = document.getElementById('category-wrap');
        let categoryContent = '';
        const addCategoryElement =
            `<div>
                <a href="${this.typeCategory}/create" class="btn border p-5 rounded-3 category-box d-flex flex-column empty align-items-center category-item" id="add-category-item">
                    <svg class="my-2"
                     width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.5469 6.08984V9.05664H0.902344V6.08984H14.5469ZM9.32422 0.511719V15.0039H6.13867V0.511719H9.32422Z"
                          fill="#CED4DA"/>
                    </svg>
                </a>
            </div>`;

        categories.forEach(category => {
            const categoryElement =
                `<div id="category-item-id-${category.id}" class="border p-4 rounded-3 category-box d-flex flex-column category-item ">
                <h3 id="category-item-title" class="text-primary-emphasis">${category.title}</h3>
                <div class="d-flex gap-2" id="category-actions">
                    <a href="${this.currentRoute}/edit?id=${category.id}" class="btn btn-primary fw-medium" id="edit-category-${category.id}">Редактировать</a>
                    <button type="button" class="btn btn-danger fw-medium delete-button" data-item="${category.id}" id="${category.id}">Удалить</button>
                </div>
            </div>`;

            //добавляем созданный элемент в контент
            categoryContent += categoryElement;
        });

        //добавляем созданный контент и кнопку добавить на страницу
        categoriesWrapElement.innerHTML = categoryContent + addCategoryElement;

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
                    popup.classList.remove('show'); // Закрываем попап после удаления
                };
            };
        });
    }

    async deleteCategory(id) {
        const result = await HttpUtils.request('/categories/' + this.currentCategory + '/' + id, 'DELETE', true);

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        //проверяем была ли ошибка или не было поля response (ответ) или был ответ и (ошибка и нет поля фрилансеры)
        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при удалении категории. Обратитесь в поддержку!');
        }

        return this.openNewRoute(this.currentRoute);
    }
}