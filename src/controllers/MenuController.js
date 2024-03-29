import EVENT_MENU from '../datas/evenMenu.js';
import ValidateMenu from '../validate/ValidateMenu.js';
import Menu from '../models/Menu.js';
import OutputView from '../views/OutputView.js';
import InputView from '../views/InputView.js';
import PromoteMenuManager from '../models/PromoteMenuManager.js';
import ERROR_MESSAGE from '../consts/errorMsg.js';

const { inValidOrder } = ERROR_MESSAGE;

class MenuController {
  #menuCategory;

  #orderMenus = [];

  #orderCategory = [];

  constructor() {
    this.#menuCategory = Object.keys(EVENT_MENU);
  }

  async setMenu() {
    const { printMessage } = OutputView;

    try {
      const selectedMenu = await this.promptMenu();
      const menus = selectedMenu.split(',').map(item => item.trim());
      this.validateMenus(menus);

      const groupedMenus = this.createMenus(menus);
      this.createOrderMenus(groupedMenus);
    } catch (error) {
      printMessage(inValidOrder);
      await this.setMenu();
    }
  }

  getTotalPrice() {
    const promoteMenuManager = new PromoteMenuManager(
      this.#orderCategory,
      this.#orderMenus,
    );
    const totalPrice = promoteMenuManager.getTotalPrice();

    return totalPrice;
  }

  async promptMenu() {
    return InputView.readMenu();
  }

  validateMenus(menus) {
    const validateMenu = new ValidateMenu(menus);
    validateMenu.start();
  }

  createMenus(promptMenus) {
    const menus = promptMenus.map(item => {
      const [name, quantity] = item.split('-').map(str => str.trim());
      return { name, quantity: Number(quantity) };
    });

    return menus;
  }

  createOrderMenus(orderMenus) {
    this.#menuCategory.forEach(category => {
      EVENT_MENU[category].forEach(item => {
        this.setOrderMenus(orderMenus, item, category);
      });
    });
  }

  setOrderMenus(orderMenus, item, category) {
    const { name: itenName, price } = item;
    const matchedMenu = this.findMathedMenu(orderMenus, itenName);

    if (!matchedMenu) {
      return;
    }

    const { quantity } = matchedMenu;
    const menuModel = new Menu(itenName, price, quantity, category);

    this.#orderMenus.push(menuModel);
    this.setOrderCategory(category);
  }

  findMathedMenu(orderMenus, itenName) {
    const matchedMenu = orderMenus.find(
      orderMenu => orderMenu.name === itenName,
    );

    return matchedMenu;
  }

  setOrderCategory(category) {
    if (!this.#orderCategory.includes(category)) {
      this.#orderCategory.push(category);
    }
  }

  getOrderMenus() {
    return this.#orderMenus;
  }
}

export default MenuController;
