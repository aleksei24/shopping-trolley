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
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    products.getProducts().then((products) => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    });
});
