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
        btns.forEach((el) => {
            let id = el.dataset.id;
            // console.log(id);
            let inTrolley = trolley.find((item) => {
                item.id === id;
            });
            if (inTrolley) {
                el.innerHTML = 'In Trolley';
                el.disabled = true;
            }
            el.addEventListener('click', (e) => {
                // console.log(e);
                e.target.innerText = 'In Trolley';
                e.target.disabled = true;
            });
        });
    }
}
// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('trolley', JSON.stringify(products));
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
