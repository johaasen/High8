var BACKEND_URL = "http://dennistempi.itm.uni-luebeck.de/mampf/";

var MampfAPI = function(apiUrl) {
    this.apiUrl = apiUrl;
    this.config = {};
        
    this.findMatches = function(async, callback) {
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    xhr.lastResponse = this.responseText;
                }
            }
        }
        
        xhr.open("POST",this.apiUrl);
        xhr.send(JSON.stringify(this.config));
    }
    this.config = {};
}

var MampfRequest = function(identity, invitees, currentPosition, timeslots) {
    this.identity = identity;
    this.invitees = invitees;
    this.currentPosition = currentPosition;
    this.timeslots = timeslots;
}

/*var JSONmessage = {
    "identity" : "placeholder",
    "invitees" : [
        "placeholder"
        ],
    "currentPosition" : {
        "longitude" : "ph",
        "latitude" : "ph"
    },
    "timeslots" : [
       {
          "startTime" : "2014-05-28T11:22:03.816+02:00",
          "endTime" : "2014-05-28T13:22:03.817+02:00"
       },
       {
          "startTime" : "2014-05-28T13:22:03.817+02:00",
          "endTime" : "2014-05-28T15:22:03.817+02:00"
       }
    ]
}*/

var demoIdentity = "B25BF7426FABCADF01103045FD7707CE";
var demoInvitees = [
    "A9B9D2ED66A5DA2AFB3247F6947F5591"
];
var demoCurrentPosition = {
    "longitude" : 9.170299499999999,
    "latitude" : 48.773556600000006
};
var demoTimeSlots = [
   {
      "startTime":"2014-05-28T11:22:03.816+02:00",
      "endTime":"2014-05-28T13:22:03.817+02:00"
   },
   {
      "startTime":"2014-05-28T13:22:03.817+02:00",
      "endTime":"2014-05-28T15:22:03.817+02:00"
   }
];

var test = new MampfAPI(BACKEND_URL);
test.config = new MampfRequest(demoIdentity, demoInvitees, demoCurrentPosition, demoTimeSlots);





