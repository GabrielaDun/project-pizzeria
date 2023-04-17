import {settings, select} from './settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.AmountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.renderValue();
    /*thisWidget.setValue(thisWidget.dom.input.value||settings.AmountWidget.defaultValue);*/
    thisWidget.initActions(thisWidget.value);

    console.log('Amount Wdiget', thisWidget);
  }

  getElements(){
    const thisWidget = this;
    
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value)
    && value >= settings.AmountWidget.defaultMin
    && value <= settings.AmountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });  
    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

  }

}

export default AmountWidget;