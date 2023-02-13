const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');

// cart
let cart = [];

let buttonDOM = [];

// getting the product
class Products {
  // using asyc intead of .then chaining which is the same
  async getProducts() {
    try {
      const result = await fetch('products.json');
      const data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const { image } = item.fields.image.fields.file.url;
        return {
          title, price, id, image,
        };
      });
      return products;
    } catch (error) {
      console.log('error');
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `
                <!--Single product-->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!--End of single product-->
           `;
    });
    productDOM.innerHTML = result;
  }

  getBagButton() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonDOM = buttons;
    buttons.forEach((button) => {
      const { id } = button.dataset;
      const inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (event) => {
        // disable button
        event.target.innerText = 'In Bag';
        event.target.disabled = true;
        // get product from products
        const cartItems = { ...Storage.getProducts(id), amount: 1 };
        // add product to cart
        cart = [...cart, cartItems];
        // save cart in local storage
        Storage.saveCart(cart);
        // save cart value
        this.saveCartValues(cart);
        // display cart items
        this.addcartItem(cartItems);
        // show cart
        this.showCart();
      });
    });
  }

  saveCartValues() {
    let tempTotal = 0;
    let itemsTotal = 1;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addcartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
                    <img src=${item.image} alt="">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
                    `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }

  setupAPP() {
    cart = Storage.getcart();
    this.saveCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addcartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }

  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart;
    });
  }

  clearCart() {
    const cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.saveCartValues(cart);
    Storage.saveCart(cart);
    const button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
            <i class="fas fa-shopping-cart"></a>add to cart
        `;
  }

  getSingleButton(id) {
    return buttonDOM.find((button) => button.dataset.id === id);
  }
}

// localStaorage
class Storage {
  static saveProduts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProducts(id) {
    const products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // get cart from stored cart
  static getcart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  // set up Ui
  ui.setupAPP();
  // getproduct via the class and instatntited method product
  products.getProducts().then((products) => {
    ui.displayProducts(products);
    Storage.saveProduts(products);
  }).then(() => {
    ui.getBagButton();
    ui.cartLogic();
  });
});
