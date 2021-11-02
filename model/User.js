const mongoose              = require("mongoose");
const { ObjectId }          = mongoose.Schema.Types;

const User_Model = mongoose.Schema({
    ProfilePic              : { type : String , default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLAFXK2MihEQSj_Udwnn1-lH6BDzU8cjq2JA&usqp=CAU" },
    Username                : { type : String },
    Email                   : { type : String },
    Password                : { type : String },
    CurrentBook             : { type : ObjectId, ref : "BookModel" },
    CurrentBookIsReturned   : { type : Boolean, default : true },
    CurrentPurchaseDate     : { type : Date },
    CurrentBookReturnDate   : { type : Date },
    Address                 : { type : ObjectId,ref : "AddressModel" },
    PurchaseHistory         : [
        {
            BookId          : { type : ObjectId,ref : "BookModel" },
            Status          : { type : String },
            OrderedDate     : { type : Date },
            ReturnDate      : { type : Date },
            ReturnedOn      : { type : Date }
        }
    ],
    IsAdmin                 : { type : Boolean, default : false}
});

module.exports = mongoose.model("UserModel" , User_Model);