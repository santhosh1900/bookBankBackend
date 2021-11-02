const mongoose              = require("mongoose");
const { ObjectId }          = mongoose.Schema.Types;

const Address_Model = mongoose.Schema({
    UserId          : { type : ObjectId,ref : "UserModel" },
    Line1           : String,
    Line2           : String, 
    City            : String, 
    Pincode         : String,     
    State           : String, 
    Landmark        : String   
});

module.exports = mongoose.model("AddressModel" , Address_Model);