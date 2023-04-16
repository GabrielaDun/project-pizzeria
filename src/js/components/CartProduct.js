import {select} from './settings.js';
import AmountWidget from './AmountWidget.js';


class CartProduct {
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();   
    thisCartProduct.initAction();  
  }
  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {
      wrapper: element,
      AmountWidgetElem: element.querySelector(select.cartProduct.AmountWidget),
      price: element.querySelector(select.cartProduct.price),
      edit: element.querySelector(select.cartProduct.edit),
      remove: element.querySelector(select.cartProduct.remove),
    };
  }
  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.AmountWidget = new AmountWidget(thisCartProduct.dom.AmountWidgetElem);
    thisCartProduct.dom.AmountWidgetElem.addEventListener('update', function(){
      thisCartProduct.amount = thisCartProduct.AmountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle  * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    }); 
  }
  remove(){
    const thisCartProduct = this;
    console.log('Remove wywolane');
    const event = new CustomEvent ('remove',{
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  initAction(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  getData(){
    const thisCartProduct = this;

    const productSummary = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    };
    console.log(productSummary);
    return productSummary;
  }
}

export default CartProduct;
