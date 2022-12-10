const mongoose              = require("mongoose");
const { ObjectId }          = mongoose.Schema.Types;

const Notification_Model = mongoose.Schema({
    BookId              : { type : ObjectId, ref : "BookModel" },
    UserId              : { type : ObjectId, ref : "UserModel" },
    Date                : { type : Date, default : new Date() },
    Message             : { type : String }
});

module.exports = mongoose.model("Notification" , Notification_Model);