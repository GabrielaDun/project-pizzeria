import { select, templates, settings, classNames } from './settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.selectedTable = null;

  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();


    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    console.log(thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerInput = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerInput = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesArea = document.querySelector(select.booking.tablesArea);
    thisBooking.dom.bookTableButton = document.querySelector(select.booking.bookTableButton); 
    thisBooking.dom.form = document.querySelector(select.booking.form);
    thisBooking.dom.timePicker= document.querySelector(select.booking.timePicker);
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.address = document.querySelector(select.booking.address);
    thisBooking.dom.duration = document.querySelector(select.booking.duration);
    thisBooking.dom.people = document.querySelector(select.booking.people);
    thisBooking.dom.starters = document.querySelectorAll(select.booking.starters);
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerInput);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerInput);

    thisBooking.dom.peopleAmount.addEventListener('update', function(){
    }); 
    thisBooking.dom.hoursAmount.addEventListener('update', function(){
    });

    thisBooking.dom.bookTableButton.addEventListener('click', function (event) {
      event.preventDefault();
      console.log('clicked');
      thisBooking.sendBooking(); 
    });

    thisBooking.dom.timePicker.addEventListener('update', function (event) {
      event.preventDefault();
      thisBooking.updateDOM();
      for (let table of thisBooking.dom.tables) {
        table.classList.remove('selected');
      } 
    }); 

    thisBooking.dom.tablesArea.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

  }
  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
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
      bookings:        settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.events   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allsResponses){
        const bookingsResponse = allsResponses[0];
        const eventsCurrentResponse = allsResponses[1];
        const eventsRepeatResponse = allsResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]){
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    console.log(eventsRepeat);
    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    
    thisBooking.updateDOM();

  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date]== 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
    return(this.booked);
  }
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  initTables(event){
    const thisBooking = this;

    const domClickedElement = event.target;
    const clickedTableByNumber = domClickedElement.getAttribute(settings.booking.tableIdAttribute);

    if (domClickedElement.classList.contains('table')){
      if (domClickedElement.classList.contains('booked')){
        console.log('stolik jest juz zarezerowany!');
      } else {
        if (this.selectedTable !== null){
          if (clickedTableByNumber==thisBooking.selectedTable) {
            domClickedElement.classList.remove('selected');
            thisBooking.selectedTable = null;
          } else{
            thisBooking.dom.tables[thisBooking.selectedTable-1].classList.remove('selected');
            domClickedElement.classList.add('selected');
            thisBooking.selectedTable = clickedTableByNumber;
          }
        }
        else {
          domClickedElement.classList.add('selected');
          thisBooking.selectedTable = clickedTableByNumber;
        }
      }
    }
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: parseInt(thisBooking.selectedTable[0]),
      duration: parseInt(thisBooking.dom.duration.value),
      ppl: parseInt(thisBooking.dom.people.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    // loop through starters to perform checks
    for(let starter of thisBooking.dom.starters){
      // add to array if starter ischecked.
      if(starter.checked == true){
        payload.starters.push(starter.value);
      }
    }
    console.log(payload);

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
      })
      .then(function(parsedResponse){
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
        thisBooking.updateDOM();
      });

    
  } 


}
export default Booking;