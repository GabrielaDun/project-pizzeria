import utils from '../utils.js';
import { select, templates, settings } from './settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

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

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('update', function(){
    }); 
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('update', function(){
    }); 

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerInput);
    thisBooking.dom.datePickerInput.addEventListener('updated', function () {
    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerInput);
    thisBooking.dom.hourPickerInput.addEventListener('updated', function () {
    });

  }
  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params', params);


    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allsResponses){
        const bookingsResponse = allsResponses[0];
        const bookingsCurrentResponse = allsResponses[1];
        const bookingsRepeatResponse = allsResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          bookingsCurrentResponse.json(),
          bookingsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat)
      });

  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.data, item.hour, item.doration, item.table);

      }
      
  }
  makeBooked(data, hour, doration, table){

  }


}
export default Booking;