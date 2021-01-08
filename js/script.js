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

// path to json file
const path = 'products.json';

// getting the products
class Products {
    // method
    async getProducts() {
        try {
            let result = await fetch(path);
            return result;
        } catch (error) {
            console.log(error);
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

    // get all products
    products.getProducts().then((data) => console.log(data));
});
