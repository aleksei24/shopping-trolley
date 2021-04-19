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
                // display the item in trolley
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
        console.log(trolleyTotal, trolleyItems);
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
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButtons();
        });
});
