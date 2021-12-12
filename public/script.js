
var socket = io();
var BoolHum = false;
var BoolTemp = false;
socket.on('temp', function(data) {
    var temperatura = data.slice(0, 2);
    var humedad = data.slice(2, 4);
    document.getElementById('tempAct').innerHTML = `${temperatura}`;
    document.getElementById('HumAct').innerHTML = `${humedad}`;



    
    if(humedad >= 46 && BoolHum == false){ //aguanta hasta 80%
        BoolHum = true;
        swal({
            title:"Advertencia!",
            text:"La humedad ha superado los limites seguros. Acercate a tu colmena lo antes posible.",
            icon: "info",
            button: "Entendido"
        })

    }
    else if(humedad < 46) {
        BoolHum = false;
    }

    if(temperatura >= 30 && BoolTemp == false){ //deberia ser entre 34 y 38
        BoolTemp = true;
        swal({
            title:"Advertencia!",
            text:"La temperatura ha superado los limites seguros. Acercate a tu colmena lo antes posible.",
            icon: "info",
            button: "Entendido"
        })
    }
    else if(temperatura < 30) {
        BoolTemp = false;
    }

});