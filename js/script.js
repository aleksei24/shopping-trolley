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
class UI {}

// local storage
class Storage {}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    products.getProducts().then((data) => console.log(data));
});
