const express           = require("express"),
      serverless        = require("serverless-http"), 
      app               = express(),
      mongoose          = require("mongoose"),
      PORT              = process.env.PORT || 3001,
      cookieParser      = require("cookie-parser"),
      bodyParser        = require("body-parser"),
      user_route        = require("../routes/Auth"),
      book_route        = require("../routes/Book"),
      Admin_route       = require("../routes/Admin"),
      {MONGO_URI}       = require("../key"),
      cors              = require("cors"),
      server            = require("http").createServer(app);
const router            = express.Router();

var io  = require("socket.io")(server , {
    cors: {
        origin          : "*",
        methods         : ["GET", "POST"],
        allowedHeaders  : ["my-custom-header"],
        credentials     : true
    }
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

mongoose.Promise        = global.Promise;
mongoose.connect(MONGO_URI,{
    useNewUrlParser: true,
    useCreateIndex : true,
    useUnifiedTopology: true,
    useFindAndModify : false	
}).then(() =>{
    console.log("connected to db cluster");
}).catch(err =>{
    console.log("error",err.message);
});

app.use(express.json({ limit : "50mb" }));
app.use(express.urlencoded({ extended : true  , limit : "50mb"}));  

router.get("/" , (req,res) => {
    res.json({message : "nothing to view here "});
});

app.use('/.netlify/functions/api',router);
app.use('/.netlify/functions/api',user_route);
app.use('/.netlify/functions/api',book_route);
app.use('/.netlify/functions/api',Admin_route);

io.on("connection" , socket=>{
    console.log("connected");
    socket.on("join_room" , (params)=> {
        socket.join(params.room);
    });
    socket.on("SendBookReceived", (data) => {
        socket.to(data.room).emit("Booksubmitted", data.data);
    });
    socket.on("disconnect", (data) => {
        console.log("disconnected")
    })
});

module.exports = app;
module.exports.handler = serverless(app);
    
// server.listen(PORT,()=>{
//     console.log("server is running in port" ,PORT);
// });