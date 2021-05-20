const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: 'zzz',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: 'xxx',
});

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

// path to json file
const path = 'products.json';

// getting the products
class Products {
    // method
    async getProducts() {
        try {
            let contentful = await client.getEntries({
                content_type: 'testShop',
            });

            /*let result = await fetch(path);
            let data = await result.json();*/

            let products = contentful.items;
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
        trolley.forEach((item) => this.addTrolleyItem(item));
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
                trolleyContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if (e.target.classList.contains('fa-chevron-up')) {
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                // console.log(addAmount);
                let tempItem = trolley.find((item) => item.id === id);
                tempItem.amount++;
                Storage.saveTrolley(trolley);
                this.setTrolleyValues(trolley);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (e.target.classList.contains('fa-chevron-down')) {
                let subtractAmount = e.target;
                let id = subtractAmount.dataset.id;
                let tempItem = trolley.find((item) => item.id === id);
                tempItem.amount--;
                if (tempItem.amount > 0) {
                    Storage.saveTrolley(trolley);
                    this.setTrolleyValues(trolley);
                    subtractAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    trolleyContent.removeChild(subtractAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    clearTrolley() {
        let trolleyItems = trolley.map((item) => item.id);
        trolleyItems.forEach((id) => this.removeItem(id));
        // console.log(trolleyContent.children);
        while (trolleyContent.children.length > 0) {
            trolleyContent.removeChild(trolleyContent.children[0]);
        }
        this.hideTrolley();
    }
    removeItem(id) {
        trolley = trolley.filter((item) => item.id !== id);
        this.setTrolleyValues(trolley);
        Storage.saveTrolley(trolley);
        let btn = this.getSingleBtn(id);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-shopping-cart"></i>add to trolley`;
    }
    getSingleBtn(id) {
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
        return products.find((item) => item.id === id);
    }
    static saveTrolley(trolley) {
        localStorage.setItem('trolley', JSON.stringify(trolley));
    }
    static getTrolley() {
        return localStorage.getItem('trolley') ? JSON.parse(localStorage.getItem('trolley')) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    // setup app
    ui.setupApp();

    // get all products
    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagBtns();
            ui.trolleyLogic();
        });
});
