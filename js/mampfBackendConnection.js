var MampfAPI = function(apiUrl) {
    this.apiUrl = apiUrl;
    
    this.sendRequest = function() {
        var xhr = new XMLHttpRequest();
        
        xhr.open("POST",this.apiUrl);
        console.log(xhr);
        
    }
}

var test = new MampfAPI("http://www.test.de");


