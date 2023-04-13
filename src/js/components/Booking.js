import utils from '../utils.js';
import { select, templates } from './settings.js';
import amountWidget from './amountWidget.js';

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
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.amountWidget = new amountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('update', function(){
    }); 
    thisBooking.hoursWidget = new amountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('update', function(){
    }); 

  }
}
export default Booking;