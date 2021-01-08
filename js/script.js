// variables
const trolleyBtn = document.querySelector('.trolley-btn');
const closeTrolleyBtn = document.querySelector('.close-trolley');
const clearTrolley = document.querySelector('.clear-trolley');
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

// path to json file
const path = 'products.json';

// getting the products
class Products {
    // method
    async getProducts() {
        try {
            let result = await fetch(path);
            let data = await result.json();
            let products = data.items;
            products = products.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            });
            return products;
        } catch (err) {
            console.log(err);
        }
    }
}
// display products
class UI {
    displayProducts(products) {
        // console.log(products);
        let result = '';
        products.forEach((product) => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img" />
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to trolley
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>£${product.price}</h4>
            </article>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagBtns() {
        const btns = [...document.querySelectorAll('.bag-btn')];
        // console.log(btns);
        buttonsDOM = btns;
        btns.forEach((el) => {
            let id = el.dataset.id;
            // console.log(id);
            let inTrolley = trolley.find((item) => item.id === id);
            if (inTrolley) {
                el.innerHTML = 'In Trolley';
                el.disabled = true;
            }
            el.addEventListener('click', (e) => {
                // console.log(e);
                e.target.innerText = 'In Trolley';
                e.target.disabled = true;
                let trolleyItem = { ...Storage.getProduct(id), amount: 1 };
                // console.log(trolleyItem);
                trolley = [...trolley, trolleyItem];
                // console.log(trolley);
                Storage.saveTrolley(trolley);
                this.setTrolleyValues(trolley);
                this.addTrolleyItem(trolleyItem);
                this.showTrolley();
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
                        <img src=${item.image} alt="product" />
                        <div>
                            <h4>${item.title}</h4>
                            <h5>£${item.price}</h5>
                            <span class="remove-item" data-id=${item.id}>remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up data-id=${item.id}"></i>
                            <p class="item-amount">${item.amount}</p>
                            <i class="fas fa-chevron-down data-id=${item.id}"></i>
                        </div>
                    `;
        trolleyContent.appendChild(div);
    }
    showTrolley() {
        trolleyOverlay.classList.add('transparentBg');
        trolleyDOM.classList.add('showTrolley');
    }
}
// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find((item) => item.id === id);
    }
    static saveTrolley(trolley) {
        localStorage.setItem('trolley', JSON.stringify(trolley));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    // get all products
    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagBtns();
        });
});
