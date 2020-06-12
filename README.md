# ics-date-converter

### iCalendar(.ics) start date changer app: 
https://ics-date-converter.herokuapp.com/

Simple web app (using node js) which takes ICS file and start date as input and users can download new ICS file.
All events will be sifted based on entered start data

example - if input start date is 6/12 and the eairliest event date in ICS file is 6/15, then the eairliest event in new ICS file is 6/12. The other events are also shifted based on start date

### how to run program
first clone my repo:
git clone https://github.com/ReoGoto/ics-date-converter your-destination-folder

then\
cd your-destination-folder\
npm install\
npm start 

and go to localhost:8000
 
### Technology  
  node.js, express
