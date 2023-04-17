class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
    thisWidget.dom = {}; // why?
    thisWidget.dom.wrapper = wrapperElement; // what for?

    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    if (newValue  !== thisWidget.value && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
  
    thisWidget.renderValue();
  }
  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
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