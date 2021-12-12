var http = require('http');
var express = require('express');
var config = require('./config');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var router = express.Router();
var app = express();
var assert = require('assert');
var ws = require('ws');
var server = http.createServer(app);
var mongodb = require('mongodb');
var io = require("socket.io")(server);
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var binary = mongodb.Binary;
var path = require('path');
//importScripts
var expressLayouts = require('express-ejs-layouts');
app.set('view engine', 'ejs');
// Static Files
app.use(express.static('public'));


app.use(express.static(__dirname +'/public'));

app.get('/', (req, res) => {
    res.send('en index(aqui va el login)')
});



var Serialport = require('serialport');
var Readline = Serialport.parsers.Readline;

var port = new Serialport('/dev/ttyUSB0', {
    baudRate: 9600
});
// On lit les donnees par ligne telles quelles apparaissent
var parser = port.pipe(new Readline({ delimiter: '\n' }));
parser.on('open', function() {
    console.log('Connexion ouverte');
});
parser.on('data', function(data) {
    io.emit('temp', data);    
    
    var temperatura = data.slice(0, 2); 
    var humedad = data.slice(2, 4);

});
io.emit('temp', 'oli');    

parser.on('temp', function(data) {

})



server.listen(3000, () => {
    console.log('Conectado al puerto', 3000);
});


var url = "mongodb+srv://chrisbastias:tics1212@cluster0.fwhqm.mongodb.net/tempHum?retryWrites=true&w=majority";

app.get('', (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("dhtTemp");
        assert.equal(null, err);
        //Declaration des variables are
        var tempDixNeufHeure;
        var humDixNeufHeure;
        var tempDouzeHeure;
        var humDouzeHeure;
        var tempHuitHeure;
        var humHuitHeure;
        var moyH;
        var moyT;
        //fin
        var col = dbo.collection('tempHum');
        col.aggregate([{ $group: { _id: "_id", moyeTemp: { $avg: "$Temperature" } } }]).toArray(function(err, items) {
            moyT = items[0].moyeTemp;
        });
        //Moyenne humidite donnees
        col.aggregate([{ $group: { _id: "_id", moyeHum: { $avg: "$Humidity" } } }]).toArray(function(err, humi) {
            moyH = humi[0].moyeHum;
        });
        //recuperation de la temperature de 8h
        col.find({ Heure: "08:00:00" }, { Temperature: 1 }).toArray(function(err, tem1) {
            tempHuitHeure = tem1[0].Temperature;
            humHuitHeure = tem1[0].Humidity;
        });
        //recuperation de la temperature de 12h
        col.find({ Heure: "12:00:00" }, { Temperature: 1 }).toArray(function(err, tem2) {
            tempDouzeHeure = tem2[0].Temperature;
            humDouzeHeure = tem2[0].Humidity;
        });
        //recuperation de la temperature de 19h
        col.find({ Heure: "19:00:00" }, { Temperature: 1 }).toArray(function(err, tem3) {
            tempDixNeufHeure = tem3[0].Temperature;
            humDixNeufHeure = tem3[0].Humidity;
            var objet = [{
                MoyTemperature: moyT,
                MoyHumidite: moyH,
                TempHuitHeure: tempHuitHeure,
                HumiditeHuitHeure: humHuitHeure,
                TemperatureDouzeHeure: tempDouzeHeure,
                HumiditeDouzeHeure: humDouzeHeure,
                TemperatureDixNeufHeure: tempDixNeufHeure,
                HumiditeDixNeufHeure: humDixNeufHeure
            }];
            res.render('index', { monObjet: objet });
            db.close();
        });

    });


});

//



port.on('error', function(err) {
    console.log(err);
});

app.use(fileUpload());
router.post("/upload", function(req, res) {
    var file = { name: req.body.name, file: binary(req.files.uploadedFiles.data) };
    insertFile(file, res);
});

function insertFile(file, res) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, base) {
        if (err) throw err;
        else {
            var db = base.db('dhtTemp');
            var collection = db.collection('donnees');
            try {
                collection.insertOne(file);
                console.log("File Inserted");
            } catch (err) {
                console.log("Erreur lors de l'insertion.", err);
            }
            base.close();
            res.redirect('/');
        }
    });
}

function getFiles(res) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, base) {
        if (err) throw err;
        else {
            var db = base.db('dhtTemp');
            var collection = db.collection('donnees');
            collection.find({}).toArray((err, doc) => {
                if (err) throw err;
                else {
                    var buffer = doc[0].file.buffer;
                    fs.writeFileSync('uploadImage.jpg', buffer);
                }
            });
            base.close();
            res.redirect('/');
        }
    });
}


app.use("/", router);