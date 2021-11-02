const mongoose              = require("mongoose");
const { ObjectId }          = mongoose.Schema.Types;

const Return_Request_Model = mongoose.Schema({
    BookId              : { type : ObjectId, ref : "BookModel" },
    UserId              : { type : ObjectId, ref : "UserModel" },
    Request_Date        : { type : Date, default : new Date() },
    Request_Success     : { type : Boolean, default : false },
    Book_Returned_Date  : { type : Date, default : null }
});

module.exports = mongoose.model("ReturnRequest" , Return_Request_Model);

