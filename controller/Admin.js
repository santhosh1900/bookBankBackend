const User                  = require("../model/User"), 
    Book                    = require("../model/Book"),
    Return_Requested_Books  = require("../model/Return_Requested_Books"),
    { StatusCodes }         = require("http-status-codes"),
    Notification            = require("../model/Notification");


module.exports = {
    Get_Return_Requests : async(req,res) => {
        try{
            const data = await Return_Requested_Books
            .find()
            .sort({ "Request_Date" : -1 })
            .populate("UserId", "Username Email")
            .populate("BookId", "Image Name");
            return res
            .status(StatusCodes.OK)
            .json({action : "ADD_RETURN_REQUESTED" , data });

        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    Get_All_Book_Bank_Books : async(req,res)=>{
        try{
            const data = await Book
            .find({})
            .sort({ "OrderCount" : -1 })
            .populate("UsersHaveThatBook", "Username Email CurrentBookIsReturned CurrentBookReturnDate CurrentPurchaseDate ProfilePic OrderCount")
            return res
            .status(StatusCodes.OK)
            .json({action : "SHOW_ALL_BOOK_BANK_BOOKS" , data });

        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    Mark_As_Received : async(req,res) => {
        try{
            var Return_Request         = await Return_Requested_Books.findById(req.body.data.id);
            var Requested_User         = await User.findById(Return_Request.UserId).populate("PurchaseHistory","Status ReturnDate");
            Requested_User.PurchaseHistory[0].Status = "BOOK_RETURNED";
            Requested_User.PurchaseHistory[0].ReturnedOn = new Date();
            Requested_User.CurrentBookIsReturned = true;
            await Requested_User.save();
            Return_Request.Request_Success = true;
            Return_Request.Book_Returned_Date = new Date();
            await Return_Request.save();
            var newNotify = {
                BookId   : Return_Request.BookId,
                UserId   : Requested_User._id,
                Message  : "Your book has been returned successfully, Now you can able to order new book",
            }
            await Notification.create(newNotify);
            await Book.updateOne({
                _id : Return_Request.BookId,
            },{
                $pull   : { UsersHaveThatBook : Requested_User._id },
                $inc    : { CopiesLeft : 1 }
            });
            var data = {
                index : req.body.data.index
            }
            return res
            .status(StatusCodes.OK)
            .json({action : "UPDATE_ONE_RETURN_REQUEST" , data});
        }catch(err){
            console.log(err)
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    List_Of_Users : async(req,res) => {
        try{
            const listOfNonAdmins = await User
            .find({ IsAdmin : false })
            .select("ProfilePic")
            .select("Email")
            .select("Username");
            return res
            .status(StatusCodes.OK)
            .json({action : "LIST_OF_USERS" , data : listOfNonAdmins});
        }catch(err){
            console.log(err)
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    Get_Users_History : async (req,res) => {
        try{
            var userHistory = await User
            .findById(req.body.data.id)
            .select("PurchaseHistory")
            .populate("PurchaseHistory.BookId","Image Name");
            return res
            .status(StatusCodes.OK)
            .json({action : "CURRENT_STUDENT_HISTORY" , data : userHistory});
        }catch(err){
            console.log(err)
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    }
}