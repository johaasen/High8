var BACKEND_URL = "http://dennistempi.itm.uni-luebeck.de/mampf/";

var MampfAPI = function(apiUrl) {
    this.apiUrl = apiUrl;
    this.config = {};
        
    this.findMatches = function(callback) {
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    console.log(xhr.responseText); //DEBUG
                    var jsonResponse = JSON.parse(xhr.responseText);
                    callback(jsonResponse);
                }
            }
        }
        
        xhr.open("POST",this.apiUrl);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify(this.config));
    }
    this.config = {};
}

var MampfConfig = function(identity, invitees, currentPosition, timeslots) {
    this.identity = identity;
    this.invitees = invitees;
    this.currentPosition = currentPosition;
    this.timeslots = timeslots;
}

function testPrinter(arg) {
    console.log(arg);
}

var demoConfig1 = {"identity":"B25BF7426FABCADF01103045FD7707CE","invitees":["A9B9D2ED66A5DA2AFB3247F6947F5591"],"currentPosition":{"longitude":9.170299499999999,"latitude":48.773556600000006},"timeslots":[{"startTime":1401621970786,"endTime":1401629170786},{"startTime":1401629170786,"endTime":1401636370786}]};

var demoConfig2 = {"identity":"A9B9D2ED66A5DA2AFB3247F6947F5591","invitees":["B25BF7426FABCADF01103045FD7707CE"],"currentPosition":{"longitude":9.170299499999999,"latitude":48.773556600000006},"timeslots":[{"startTime":1401622489545,"endTime":1401629689545},{"startTime":1401629689545,"endTime":1401636889546}]};

var test = new MampfAPI(BACKEND_URL);
test.config = demoConfig1;

/*
var apiObject = new MampfAPI(BACKEND_URL);
apiObject.config = new MampfConfig(identity, invitees, currentPosition, timeslots);
apiObject.findMatches(callback);
*/

 