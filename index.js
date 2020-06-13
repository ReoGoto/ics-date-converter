const { writeFileSync } = require('fs')
const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload')
const ical = require('node-ical');
//const ics = require('ics')
const ical_w = require('ical-generator');
var moment = require('moment-timezone');
const { start } = require('repl');

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
  console.log( "input " + start_date.toISOString() )

  var diff = start_date.getTimezoneOffset()
  console.log("diff " + diff )

  //moment().tz("America/Los_Angeles").format();
  start_date.setHours(start_date.getHours(),start_date.getMinutes() + 0*start_date.getTimezoneOffset() );

  //  start_date.toISOString()  //=> "2020-04-12T16:00:00.000Z"
  console.log("now " +   start_date.toISOString()    )
  //console.log("now   " + start_date )

  //const events = ical.sync.parseFile('JusticeJune.ics');
  const events = ical.sync.parseICS(req.files.document.data.toString() );

  var dates = []; 
  for (const event of Object.values(events)) {
      if(event.start)
        dates.push(new Date(event.start )); 
  };
  var minimumDate = dates[0]
  console.log( typeof(minimumDate))
//  minimumDate.setHours(minimumDate.getHours(),minimumDate.getMinutes() - diff )

  for(i = 1; i<dates.length; i++){
    if(minimumDate.getTime() > dates[i].getTime()){
      //console.log( "min date" + dates[i])
      minimumDate = dates[i]
    }
  }

  console.log(minimumDate)
  minimumDate.setUTCHours( minimumDate.getUTCHours()-5, minimumDate.getUTCMinutes()  )
  console.log( "minday " + minimumDate.toISOString())


  console.log(start_date.getDate() - minimumDate.getDate())
  console.log("stday " + start_date.getDate() + " minday " + minimumDate.getDate())
  // var Difference_In_Time = start_date.getTime() - minimumDate.getTime(); 
  // var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
  var s = new Date(start_date)
  var m = new Date(minimumDate)
  s.setUTCHours(0,0,0)
  m.setUTCHours(0,0,0)
  var Difference_In_Days = s.getDate() - m.getDate()
  

  for (const event of Object.values(events)) {
      if(event.start && event.end){
        //console.log("old" + event.start)

        var stdate = new Date(event.start);
        var endate = new Date(event.end);
        event.start.setUTCHours(stdate.getUTCHours()-5, stdate.getUTCMinutes()  );
        event.end.setUTCHours(endate.getUTCHours()-5, endate.getUTCMinutes()  );
        event.start.setDate(stdate.getDate() + Math.abs(Difference_In_Days));
        event.end.setDate(endate.getDate() + Math.abs(Difference_In_Days));        

        //console.log("new " + event.start.toISOString())
        //console.log("==========================")
      }
      if(event.rrule)
        console.log("rrule " + event.rrule)
      
     // console.log(event.start.toISOString() )
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
  console.log(event_list[0].start)

  for(i = 0; i < repeat_event_list.length; i++){
    //repeat_event_list[i].rrule.options.dtstart = repeat_event_list[i].start
    var freq = repeat_event_list[i].rrule.options.freq
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
  
  console.log("==================")
  // console.log(event_list[0])
  console.log("==================")


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