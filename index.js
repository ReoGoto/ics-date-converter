const { writeFileSync } = require('fs')
const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload')
const ical = require('node-ical');
//const ics = require('ics')
const ical_w = require('ical-generator');
const { Console } = require('console');

const app = express()
app.use(fileUpload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

app.post('/submit-form', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  var filename = req.files.document.name
  //console.log( req.files.document.name); // the uploaded file object
  var start_date = new Date(req.body.startDate)
  console.log( start_date )

  //const events = ical.sync.parseFile('JusticeJune.ics');
  const events = ical.sync.parseICS(req.files.document.data.toString() );
  
  var dates = []; 
  for (const event of Object.values(events)) {
      if(event.start)
        dates.push(new Date(event.start )); 
  };
  var minimumDate = dates[0]

  for(i = 1; i<dates.length; i++){
    if(minimumDate.getTime() > dates[i].getTime()){
      console.log( "min date" + dates[i])
      minimumDate = dates[i]
    }
  }

  //var minimumDate = new Date(Math.min.apply(null, dates)); 
  console.log(minimumDate )
  //start_date.setUTCHours(minimumDate.getUTCHours())
  
  //start_date.setHours(minimumDate.getHours())
  console.log(start_date.getDate() - minimumDate.getDate())
  
  // var Difference_In_Time = start_date.getTime() - minimumDate.getTime(); 
  // var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
  var s = new Date(start_date)
  var m = new Date(minimumDate)
  s.setHours(0,0,0)
  m.setHours(0,0,0)
  // s.setUTCHours(0,0,0)
  // m.setUTCHours(0,0,0)
  var Difference_In_Days = s.getDate() - m.getDate()
  console.log("s " + s)
  console.log("m " + m)

  console.log( Difference_In_Days )

  for (const event of Object.values(events)) {
      if(event.start && event.end){
        var stdate = new Date(event.start);
        var endate = new Date(event.end);
        event.start.setHours(stdate.getHours(),stdate.getMinutes() + event.start.getTimezoneOffset() );
        event.end.setHours(endate.getHours(),endate.getMinutes() + event.start.getTimezoneOffset() );
        event.start.setUTCDate(stdate.getUTCDate() + Math.abs(Difference_In_Days));
        event.end.setUTCDate(endate.getUTCDate() + Math.abs(Difference_In_Days));
      }
      if(event.rrule)
        console.log("rrule " + event.rrule)

      // var v = new Date(2020,2,2,2,2+start_date.getTimezoneOffset())
      // console.log("values " + v)
      
  };
  
  var event_list = [];
  var repeat_event_list = []
  var no_event = []
  for (const event of Object.values(events)) {
    if(event.type === 'VEVENT')
      if (event.rrule)
        repeat_event_list.push(event)
      else
        event_list.push(event)   
    else
      no_event.push(event)
  }


  const cal  = ical_w(no_event)
  cal.events(event_list)
  console.log(event_list[0])

  for(i = 0; i < repeat_event_list.length; i++){
    //repeat_event_list[i].rrule.options.dtstart = repeat_event_list[i].start
    //repeat_event_list[i].rrule.options.byweekday = [ 4 ]
    var freq = repeat_event_list[i].rrule.options.freq
    //console.log("freq " + freq)
    if( freq == 1 ) 
      freq = "DAILY"
    else if( freq == 2)
      freq = "WEEKLY"
    else if( freq == 3)
      freq = "YEARLY"
    else 
      freq = ""
    
    if(freq)
      cal.createEvent(repeat_event_list[i]).repeating({freq: freq })// required
  }
  
  writeFileSync(`${__dirname}/event.ics`, cal.toString(), (err) => {
    if (err) return console.log(err);
    console.log('ics is saved');
  });

  res.download('./event.ics', `${filename}`, (err) => {
    if (err) {
      console.log("download error")
      console.log(err)
      return
    } else {
      console.log("File is sent")
      //res.send('File uploaded!');
    }
  })

})


const PORT = process.env.PORT || 8000
app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));