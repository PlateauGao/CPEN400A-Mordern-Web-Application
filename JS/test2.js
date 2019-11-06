var ajaxGet = function(url, onSuccess, onError) {
    var cnt = 0;
    var getHandler = function() {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url);

        xhttp.timeout = 2000; // 2 seconds
        xhttp.ontimeout = function() {
            console.log("time out at: " + cnt);
            cnt++;
            if (cnt <= 3) getHandler();
            else {
                console.log("fai: error ");
                onError(this.status)
            }
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    console.log("success ");
                    onSuccess(this.response)
                } else {
                    cnt++
                    if (cnt >= 3) {
                        console.log("fai: error ");
                        onError(this.status)
                    } else {
                        console.log("fail:retry " + cnt + " times");
                        getHandler()
                    }
                }
            }
        }
        xhttp.send();
    }
    getHandler();
}


ajaxGet("https://cpen400a-bookstore.herokuapp.com/products",
    function(response) {
        console.log(response)

    },
    function(error) {
        console.log(error);

    }
);