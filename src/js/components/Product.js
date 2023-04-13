import {select, classNames, templates} from './settings.js';
import utils from '../utils.js';
import amountWidget from './amountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu(){
    const thisProduct = this;
    const generatedHTMLForProductSection = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTMLForProductSection);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);

  }
  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion(){
    const thisProduct = this;

    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.active');
      if (activeProduct && activeProduct!== thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      } 
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }
  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  } 

  processOrder(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    let price = thisProduct.data.price;

    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      for(let optionId in param.options) {
        const option = param.options[optionId];
        
        const wordImage = '.' + paramId + '-' + optionId;
        const optionImage = thisProduct.imageWrapper.querySelector(wordImage);

        if(formData[paramId] && formData[paramId].includes(optionId)) {
          if (optionImage){
            optionImage.classList.add('active');
          }
          // check if the option is not default
          if(!option.default) {
            price += option.price;
          }
        } 
        else {
          if (optionImage){
            optionImage.classList.remove('active');
          }
          // check if the option is default
          if(option.default) {
            // reduce price variable
            price -= option.price;
            
          }
        }  
      }
    }

    thisProduct.priceSingle = price;
    let amount = thisProduct.amountWidget.value;
    price *= amount;
    thisProduct.priceElem.innerHTML = price;
  }
  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('update', function(){
      thisProduct.processOrder();
    }); 

  }
  addToCart(){
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);

  }
  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
    };
    console.log(productSummary);
    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    let params= {};

    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {}
      };

      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if (optionSelected){
        //option is selected!
          params[paramId].options[optionId] = option.label;
        }
      }  
    }
    return params;
  } 

} 
export default Product;