// variables
const trolleyBtn = document.querySelector('.trolley-btn');
const closeTrolleyBtn = document.querySelector('.close-trolley');
const clearTrolleyBtn = document.querySelector('.clear-trolley');
const trolleyDOM = document.querySelector('.trolley');
const trolleyOverlay = document.querySelector('.trolley-overlay');
const trolleyItems = document.querySelector('.trolley-items');
const trolleyTotal = document.querySelector('.trolley-total');
const trolleyContent = document.querySelector('.trolley-content');
const productsDOM = document.querySelector('.products-center');

// trolley
let trolley = [];

// buttons
let buttonsDOM = [];

// path to json-file
const path = 'products.json';

// getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch(path);
            let data = await result.json();
            let products = data.items;
            products = products.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const img = item.fields.image.fields.file.url;
                return { title, price, id, img };
            });
            return products;
        } catch (err) {
            console.error(err);
        }
    }
}

// display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach((el) => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${el.img} alt="" class="product-img" />
                    <button class="bag-btn" data-id=${el.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to trolley
                    </button>
                </div>
                <h3>${el.title}</h3>
                <h4>$${el.price}</h4>
            </article>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach((btn) => {
            let id = btn.dataset.id;
            let inTrolley = trolley.find((item) => item.id === id);
            if (inTrolley) {
                btn.innerText = 'In Trolley';
                btn.disabled = true;
            }
            btn.addEventListener('click', (e) => {
                e.target.innerText = 'In Trolley';
                e.target.disabled = true;

                let trolleyItem = { ...Storage.getProduct(id), amount: 1 };
                trolley = [...trolley, trolleyItem];
                Storage.saveTrolley(trolley);
                this.setTrolleyValues(trolley);
                this.addTrolleyItem(trolleyItem);
                // it is annoying to see the trolley everytime a product is chosen
                // this.showTrolley();
            });
        });
    }

    setTrolleyValues(trolley) {
        let tempTotal = 0;
        let itemsTotal = 0;
        trolley.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        trolleyTotal.innerText = parseFloat(tempTotal.toFixed(2));
        trolleyItems.innerText = itemsTotal;
    }

    addTrolleyItem(item) {
        const div = document.createElement('div');
        div.classList.add('trolley-item');
        div.innerHTML = `
            <img src=${item.img} alt="" />
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `;
        trolleyContent.appendChild(div);
    }

    showTrolley() {
        trolleyOverlay.classList.add('transparentBg');
        trolleyDOM.classList.add('showTrolley');
    }

    setupApp() {
        trolley = Storage.getTrolley();
        this.setTrolleyValues(trolley);
        this.populateTrolley(trolley);
        trolleyBtn.addEventListener('click', this.showTrolley);
        closeTrolleyBtn.addEventListener('click', this.hideTrolley);
    }

    populateTrolley(trolley) {
        trolley.forEach((el) => {
            this.addTrolleyItem(el);
        });
    }

    hideTrolley() {
        trolleyOverlay.classList.remove('transparentBg');
        trolleyDOM.classList.remove('showTrolley');
    }

    trolleyLogic() {
        clearTrolleyBtn.addEventListener('click', () => {
            this.clearTrolley();
        });
        trolleyContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                trolleyContent.removeChild(
                    removeItem.parentElement.parentElement
                );
                this.removeItem(id);
            } else if (e.target.classList.contains('fa-chevron-up')) {
                let increaseAmount = e.target;
                let id = increaseAmount.dataset.id;
                let tempItem = trolley.find((item) => item.id === id);
                tempItem.amount++;
                Storage.saveTrolley(trolley);
                this.setTrolleyValues(trolley);
                increaseAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (e.target.classList.contains('fa-chevron-down')) {
                let decreaseAmount = e.target;
                let id = decreaseAmount.dataset.id;
                let tempItem = trolley.find((item) => item.id === id);
                tempItem.amount--;
                if (tempItem.amount > 0) {
                    Storage.saveTrolley(trolley);
                    this.setTrolleyValues(trolley);
                    decreaseAmount.previousElementSibling.innerText =
                        tempItem.amount;
                } else {
                    trolleyContent.removeChild(
                        decreaseAmount.parentElement.parentElement
                    );
                    this.removeItem(id);
                }
            }
        });
    }

    clearTrolley() {
        let trolleyItems = trolley.map((item) => item.id);
        trolleyItems.forEach((el) => {
            this.removeItem(el);
        });
        while (trolleyContent.children.length > 0) {
            trolleyContent.removeChild(trolleyContent.children[0]);
        }
        this.hideTrolley();
    }

    removeItem(id) {
        trolley = trolley.filter((item) => item.id !== id);
        this.setTrolleyValues(trolley);
        Storage.saveTrolley(trolley);
        let btn = this.getSingleButton(id);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-shopping-cart"></i>add to trolley`;
    }

    getSingleButton(id) {
        return buttonsDOM.find((btn) => btn.dataset.id === id);
    }
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find((el) => el.id === id);
    }

    static saveTrolley(trolley) {
        localStorage.setItem('my-trolley', JSON.stringify(trolley));
    }

    static getTrolley() {
        return localStorage.getItem('my-trolley')
            ? JSON.parse(localStorage.getItem('my-trolley'))
            : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    ui.setupApp();

    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButtons();
            ui.trolleyLogic();
        });
});
