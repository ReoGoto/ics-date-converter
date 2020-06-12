# ics-date-converter

### iCalendar(.ics) start date changer app 
httpsics-date-converter.herokuapp.com

Simple web app (using node js) which takes ICS file and start date as input and users can download new ICS file.
All events will be sifted based on entered start data

example - if input start date is 612 and the eairliest event date in ICS file is 615, then the eairliest event in new ICS file is 612. The other events are also shifted based on start date

### how to run program
first clone my repo
git clone httpsgithub.comReoGotoics-date-converter your-destination-folder

then
cd your-destination-folder
npm install
npm start 

and go to localhost8000
 
### Technology  
  node.js, express
