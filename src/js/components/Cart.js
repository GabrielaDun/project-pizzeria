import {settings, select, classNames, templates} from './settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {
      wrapper: element,
      toggleTrigger: element.querySelector(select.cart.toggleTrigger),
      productList: element.querySelector(select.cart.productList),
      deliveryFee: element.querySelector(select.cart.deliveryFee),
      form: element.querySelector(select.cart.form),
      subtotalPrice: element.querySelector(select.cart.subtotalPrice),
      totalPrice: element.querySelector(select.cart.totalPrice),
      totalPriceSummery: element.querySelector(select.cart.totalPriceSummery),
      address: element.querySelector(select.cart.address),
      phone: element.querySelector(select.cart.phone),
    
    };

  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('update', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }
  add (menuProduct){
    const thisCart = this;
    console.log('adding product', menuProduct);
    /* We could add for statment here to seperate instances in which 
    product is new in cart or is already there
    if (thisCart.product includes (menuProduct)
    thisCart.amount+= thisProduct.amount) */
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = thisCart.dom.productList;
    /* add element to menu */
    menuContainer.appendChild(generatedDOM); 
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }
  update (){
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0; //calkowita liczba sztuk
    thisCart.subtotalPrice = 0; // szumowana cena za wszytsko
    thisCart.totalPrice =thisCart.subtotalPrice + deliveryFee;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;

    for (let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.subtotalPrice + deliveryFee;
      thisCart.dom.totalPriceSummery.innerHTML = thisCart.subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    /*thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;*/
    }
  }
  remove(cartProduct){
    const thisCart = this;
    console.log(thisCart);
    cartProduct.dom.wrapper.remove();

    /* Delete info about the product from thisCart.products*/
    const productIn = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(productIn);
    thisCart.update();

    /*Init an update function*/

  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedRespones', parsedResponse);
      });

    
  }

}
export default Cart;