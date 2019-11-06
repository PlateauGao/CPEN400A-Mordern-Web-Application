var ajaxGet = function(url, onSuccess, onError, count) {
    var URL = url;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", URL);
    // count = count + 1;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log("try call onSuccess");
                response = JSON.parse(this.responseText);
                onSuccess(response);
            } else if (this.status == 0 || rgus.status == 500) {
                if (count < 3) {
                    ajaxGet(url, onSuccess, onError, count + 1);
                } else {
                    onError(this.status);

                }
            }

        }
    }

    xhttp.timeout = 5000;
    console.log("Sending request " + xhttp);
    xhttp.send();

}

ajaxGet("https://cpen400a-bookstore.herokuapp.com/products",
    function(response) {
        // do something with the response
    },
    function(error) {
        // this function should be invoked only after all 3 retries have failed.
        // do something with the error
    }
);