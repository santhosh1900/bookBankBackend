const mongoose              = require("mongoose");
const { ObjectId }          = mongoose.Schema.Types;

const Book_model = mongoose.Schema({
    Image               : { type : String },
    Name                : { type : String },
    Description         : { type : String },
    Author              : { type : String },
    Copies              : { type : Number },
    CopiesLeft          : { type : Number },
    UsersHaveThatBook   : [{ type : ObjectId, ref : "UserModel" }],
    OrderCount          : { type : Number, default : 0},
    RequestLimit        : { type : Number },
    Category            : {  type : String },
    UsersRequested      : [
        {
            User : { type : ObjectId, ref : "UserModel" }
        }
    ],
});

module.exports = mongoose.model("BookModel" , Book_model);

