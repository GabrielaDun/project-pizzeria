

class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.value = initialValue;
  }

  get Value(){
    const thisWidget = this;
    return thisWidget.value;
  }

  setValue(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    if (newValue  !== thisWidget.value && thisWidget.isValid(newValue)) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }
  
    thisWidget.renderValue();
  }
  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce(){
    const thisWidget = this;

    const event = new CustomEvent ('update',{
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;