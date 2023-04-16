import utils from '../utils.js';
import { select, templates } from './settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.element = element;
    thisBooking.render(element);
    thisBooking.initWidgets();

  }
  render(){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(thisBooking.data);
    thisBooking.dom = utils.createDOMFromHTML(generatedHTML);
    const bookingContainer = document.querySelector(select.containerOf.booking);
    bookingContainer.appendChild(thisBooking.dom);

    
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerInput = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerInput = document.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.AmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('update', function(){
    }); 
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('update', function(){
    }); 

    thisBooking.datePicker = new AmountWidget(thisBooking.dom.datePickerInput);
    thisBooking.dom.datePickerInput.addEventListener('update', function(){
    }); 
    thisBooking.hourPicker = new AmountWidget(thisBooking.dom.hourPickerInput);
    thisBooking.dom.hourPickerInput.addEventListener('update', function(){
    }); 

  }
}
export default Booking;