//global variables
let express = require('express');
let app = express();
let routerGet = require("./api/get")
let routerPost = require("./api/post")
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Permite todas las solicitudes de cualquier origen
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
  });
// Route middle
app.use(routerGet);
app.use(routerPost);

//server initialization
let port = process.env.PORT || 3000;
app.set('port', port);
app.listen(app.get('port'), function(){
});


// exported variables
module.exports = app;