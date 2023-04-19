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
    thisBooking.selectedTable = [];

  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();


    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerInput = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerInput = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesArea = document.querySelector('.floor-plan');
    thisBooking.dom.bookTableButton = document.querySelector(select.booking.bookTableButton); 
    console.log(thisBooking.dom.tablesArea);     
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

    thisBooking.dom.datePickerInput.addEventListener('updated', function () {
    });

    thisBooking.dom.hourPickerInput.addEventListener('updated', function () {
    });
    thisBooking.dom.wrapper.addEventListener('update', function(){
      thisBooking.updateDOM();
      for (let table of thisBooking.dom.tables) {
        table.classList.remove('selected');
        thisBooking.tableToBook = [];
      }

    });    
    
    console.log(thisBooking.dom.tablesArea);
    thisBooking.dom.tablesArea.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

    /*
    thisBooking.dom.bookTableButton.addEventListener('click', function (event) {
      event.preventDefault();
      /* thisBooking.sendBooking(); 
    });
    */


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
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
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
    const tableByNumber = event.target.getAttribute(settings.booking.tableIdAttribute);
    const clickedElement = event.target;
    console.log(clickedElement);
    console.log(this.selectedTable.length);
    console.log(thisBooking.dom.tables);
    if (clickedElement.classList.contains('table')){
      if (clickedElement.classList.contains('booked')){
        console.log('stolik jest juz zarezerowany!');

      } else {
        if (this.selectedTable.length>0){
          const greenTable = this.selectedTable[0]-1;
          console.log(greenTable);
          const dblClickedEl = clickedElement.getAttribute(settings.booking.tableIdAttribute)-1;
          console.log(dblClickedEl);
          console.log(clickedElement.getAttribute(settings.booking.tableIdAttribute))
          if (dblClickedEl==greenTable) {
            clickedElement.classList.remove('selected')
          } else{
            console.log(clickedElement);
            thisBooking.dom.tables[greenTable].classList.remove('selected');
            clickedElement.classList.add('selected')
            thisBooking.selectedTable = [];
            thisBooking.selectedTable.push(tableByNumber);
          }
        }
        else {
          clickedElement.classList.add('selected')
          thisBooking.selectedTable.push(tableByNumber);
        }
      }
    }
  
      

    //console.log(thisBooking.booked); // info about reservations
    //console.log(thisBooking.date); // info about date selected
    //console.log(thisBooking.hour); // info about the hour




    /*if (
      thisBooking.booked[thisBooking.date][thisBooking.hour] !== "undefined" 
      &&
      thisBooking.booked[thisBooking.date][thisBooking.hour]!== ([tableByNumber])){
      console.log('yes, you can book it!');
    }
    else {
      console.log('sorry no you cant book it');
    } */
    /*if (thisBooking.booked[date]*/



  }

  /*sendBooking(){
    const thisBooking = this;
    const url = "localhost:3131/bookings";
    const payload = {
      'date': data wybrana w datePickerze
      "hour": godzina wybrana w hourPickerze (w formacie HH:ss)
      "table": numer wybranego stolika (lub null jeśli nic nie wybrano)
      "duration": liczba godzin wybrana przez klienta
      "ppl": liczba osób wybrana przez klienta
      "starters": [],
      "phone": numer telefonu z formularza,
      "address": adres z formularza
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
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
      }).then(function(parsedResponse){
        console.log('parsedRespones', parsedResponse);
      });
    

    
  } */


}
export default Booking;