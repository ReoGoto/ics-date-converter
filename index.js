const { writeFileSync } = require('fs')
const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload')
const ical = require('node-ical');
//const ics = require('ics')
const ical_w = require('ical-generator');

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
  //console.log( start_date )

  //const events = ical.sync.parseFile('JusticeJune.ics');
  const events = ical.sync.parseICS(req.files.document.data.toString() );
  
  var dates = []; 
  for (const event of Object.values(events)) {
      dates.push(new Date(event.start )); 
  };

  var minimumDate = new Date(Math.min.apply(null, dates)); 
  console.log(minimumDate )
  console.log(minimumDate.getUTCHours() )
  start_date.setUTCHours(minimumDate.getUTCHours())
  //start_date.setHours(minimumDate.getHours())
  var Difference_In_Time = start_date.getTime() - minimumDate.getTime(); 
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
  //var Difference_In_Days = start_date.getDate() - minimumDate.getDate()

  for (const event of Object.values(events)) {
      var stdate = new Date(event.start);
      var endate = new Date(event.end);
      event.start.setDate(stdate.getDate() + Math.abs(Difference_In_Days));
      event.end.setDate(endate.getDate() + Math.abs(Difference_In_Days));
  };
  
  var event_list = [];
  for (const event of Object.values(events)) {
    event_list.push(event)
  }

  const cal  = ical_w()
  cal.events(event_list)
  //cal.timezone(events.timezone);
   
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