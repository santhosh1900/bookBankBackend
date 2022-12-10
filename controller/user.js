const { StatusCodes }   = require("http-status-codes"),
    User              = require("../model/User"),    
    Helpers           = require("../middleware/helpers"),
    bcrypt            = require("bcryptjs"),
    jwt               = require("jsonwebtoken"),
    bdConfig          = require("../config/jwt"),
    Address           = require("../model/Address"),
    Book              = require("../model/Book"),
    ReturnRequest     = require("../model/Return_Requested_Books"),
    Notification      = require("../model/Notification");


module.exports = {
    RegisterUser : async (req,res) => {
        try{
            var Username    = req.body.username,
                Password    = req.body.password,
                Email       = req.body.email;
            var existedUser   = await User.findOne({Email : Email});
            if(existedUser){
                return res
                .status(StatusCodes.CONFLICT)
                .json({ message : "User already exist" });
            };
            return bcrypt.hash(Password , 13 , (err, hash) => {
                if(err){
                    return res
                        .status(StatusCodes.BAD_REQUEST)
                        .json({ message : "Please enter valid password" })
                }
                const body = {
                    Email       : Email,
                    Username    : Helpers.firstUpper(Username),
                    Password    : hash
                };
                User.create(body).then(async user => {
                    var token_user = await User.findById(user._id).select("Username").select("_id").select("Email").select("ProfilePic").select("IsAdmin");
                    const token = jwt.sign({ data : token_user } , bdConfig.secret , {
                        expiresIn : "2hr"
                    });
                    res.cookie("auth" , token);
                    return res
                        .status(StatusCodes.CREATED)
                        .json({ message : "User created successfully", token , token_user });
                }).catch(error => {
                    return res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({message : "Oops something went wrong"});
                });
            });
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    LoginUser : async (req,res) => {
        try{
            const Email         = req.body.email;
            const user          = await User.findOne({Email : Email}).select("Username").select("_id").select("Email").select("ProfilePic").select("IsAdmin");
            const user2         = await User.findOne({Email : Email}).select("Password");
                if(!user){
                    return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message : "Account not found"});
                }
                await bcrypt.compare(req.body.password , user2.Password).then((result) => {
                    if(!result){
                        return res
                        .status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({message : "Username or Password is incorrect"});
                    }
                    const token = jwt.sign({data : user } , bdConfig.secret , {
                        expiresIn : "2hr"
                    });
                    res.cookie("auth" , token);
                    return res
                    .status(StatusCodes.OK)
                    .json({ message : "Login Successfully" , token , token_user : user });
            });
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured"});
        }
    },

    GetUserAddress : async (req,res) => {
        try{
            var User_address   = await Address.findOne({ UserId : req.user._id }).populate("UserId","CurrentBookIsReturned");
            if(User_address){
                return res
                .status(StatusCodes.OK)
                .json({action : "ADD_ADDRESS" , data : User_address });
            }else{
                return res
                .status(StatusCodes.OK)
                .json({action : "ADD_ADDRESS" , data : null });
            }
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured"});
        }
    },
    
    AddAddress : async (req,res) => {
        try{
            const Request_User      = await User.findById(req.user._id);
            if(Request_User.Address){
                await Address.deleteOne({UserId : req.user._id});
                // await Address.findOne({  }).delete();
            }
            const data = {
                UserId          : req.user._id,
                Line1           : req.body["data"][0]["Value"],
                Line2           : req.body["data"][1]["Value"], 
                City            : req.body["data"][2]["Value"], 
                Pincode         : req.body["data"][3]["Value"],     
                State           : req.body["data"][4]["Value"], 
                Landmark        : req.body["data"][5]["Value"]  
            }
            const created_address   = await Address.create(data);
            Request_User.Address    = created_address._id;
            Request_User.save();
            return res
            .status(StatusCodes.OK)
            .json({action : "ADD_ADDRESS" , data : created_address });
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : err.message});
        }
    },

    OrderBook : async (req,res) => {
        try{
            var orderBook       = await Book.findById(req.body.data.id);
            var orderedUser     = await User.findById(req.user._id);
            var ReturnDate      = new Date();
            ReturnDate.setDate(ReturnDate.getDate() + 7);
            if(orderBook.CopiesLeft > 0 && orderedUser.CurrentBookIsReturned){
                orderBook.CopiesLeft                = orderBook.CopiesLeft - 1;
                await orderBook.UsersHaveThatBook.push(orderedUser._id);
                orderedUser.CurrentBook             = orderBook._id;
                orderedUser.CurrentPurchaseDate     = new Date();
                orderedUser.CurrentBookReturnDate   = ReturnDate;
                orderedUser.CurrentBookIsReturned   = false;
                const CurrentBookhistory            = {
                    BookId          : orderBook._id,
                    Status          : "NOT_RETURNED",
                    OrderedDate     : new Date(),
                    ReturnDate
                }
                await orderedUser.PurchaseHistory.unshift(CurrentBookhistory);
                orderBook.OrderCount = orderBook.OrderCount + 1;
                await orderedUser.save();
                await orderBook.save();
                var updated__address =  await Address.findOne({ UserId : req.user._id }).populate("UserId","CurrentBook BookReturnDate");
                return res
                .status(StatusCodes.OK)
                .json({action : "ADD_ADDRESS",data : updated__address , action2 : "UPDATE_ONE_BOOK" , BOOKID : orderBook._id , CopiesLeft : orderBook.CopiesLeft });
            }else if(orderBook.CopiesLeft <= 0){
                return res
                .status(StatusCodes.OK)
                .json({message : "No Copies left", action2 : "UPDATE_ONE_BOOK" , BOOKID : orderBook._id , CopiesLeft : orderBook.CopiesLeft});
            }else{
                return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message : "You need return the old book to order books"});
            }
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured"});
        }
    },

    GetUserPurchaseHistory : async(req,res) => {
        try{
            var PurchaseHistory     = await User.findById(req.user._id).select("PurchaseHistory").populate("PurchaseHistory.BookId","Image Name Description");
            return res
            .status(StatusCodes.OK)
            .json({ action : "ADD_PURCHASE_HISTORY" , data : PurchaseHistory });
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured"});
        }
    },

    RequestBookReturn : async (req,res) => {
        try{
            var Current_User = await User.findById(req.user._id).select("PurchaseHistory").populate("PurchaseHistory.BookId","Image Name Description");
            Current_User.PurchaseHistory[0].Status = "REQUEST_RETURN";
            await Current_User.save();
            const returnRequestBody = {
                BookId  : Current_User.PurchaseHistory[0].BookId,
                UserId  : req.user._id
            }
            await ReturnRequest.create(returnRequestBody);
            return res
            .status(StatusCodes.OK)
            .json({ action : "ADD_PURCHASE_HISTORY", data : Current_User });
            
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured"});
        }
    },

    GetNotification : async (req,res) => {
        try{
            const User_notification = await Notification
            .find({UserId : req.user._id})
            .sort({ "Date" : -1 })
            .populate("BookId","Image Name");
            return res
            .status(StatusCodes.OK)
            .json({ action : "ADD_NOTIFICATION", data : User_notification });

        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured"});
        }
    }
}