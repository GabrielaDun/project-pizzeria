/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars


{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  const app = {
    initMenu: function() {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
      console.log(dataSource);
      console.log(thisApp);
    },
    init: function(){
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart (cartElem);
    }

  };

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
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('.product.active');
        //console.log(activeProduct);
        //console.log(thisProduct.element);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct!== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        } 
        /* toggle active class on thisProduct.element */
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

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log(formData);

      // set price to default price
      let price = thisProduct.data.price;
      // let priceSingle = thisProduct.data.price;
      //console.log(price);

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // check if there is param with a name of paramId in formData and if it includes optionId
          
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

      /*let price = thisProduct.amountWidget.value * priceSingle ;*/
      thisProduct.priceSingle = price;
      console.log('price Single', this.priceSingle);
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
      console.log('price', price);
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
      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        params: thisProduct.prepareCartProductParams(),
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
      };
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      let params= {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {}
        };
        console.log(params);
        console.log(params[paramId]);

        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          console.log(optionSelected);
          if (optionSelected){
          //option is selected!
            params[paramId].options[optionId] = option.label;
          }
        }  
      }
      return params;
    } 
      
  }
  
  class amountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    announce(){
      const thisWidget = this;
      const event = new Event ('update');
      thisWidget.element.dispatchEvent(event);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      /* Validation */
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
      }
  
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });  
      thisWidget.linkDecrease.addEventListener('click', function(){
        
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(){
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    
  }
  class Cart {
    constructor(element){
      const thisCart = this;
      thisCart.getElements(element);
      thisCart.initAction();
      thisCart.products = [];
    }
  
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initAction(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
    add (menuProduct){
      const thisCart = this;
      console.log('adding product', menuProduct);
      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct); //thisProduct.data prabobly needs to be changed
      /* create element using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = thisCart.dom.productList;
      /* add element to menu */
      menuContainer.appendChild(generatedDOM); 
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);
    }
    

  }

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
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {
        wrapper: element,
        amountWidget: element.querySelector(select.cartProduct.amountWidget),
        price: element.querySelector(select.cartProduct.price),
        edit: element.querySelector(select.cartProduct.edit),
        remove: element.querySelector(select.cartProduct.remove),
      };
    }
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('update', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle  * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      }); 
    }
  }

  app.init();
}
