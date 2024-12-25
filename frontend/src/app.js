import "./styles/styles.scss";
import {Router} from "./router.js";


class App {
    constructor() {
        new Router();  //создаем новый экземпляр класса Router
    }
}

(new App()); //создаем новый экземпляр класса App