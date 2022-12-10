const User              = require("../model/User"), 
    Book                = require("../model/Book"),
    { StatusCodes }     = require("http-status-codes"); 


module.exports = {
    createBook : async(req , res) => {
        try{
            const data = {
                Image           : req.body.data.image,
                Name            : req.body.data.name,
                Description     : req.body.data.description,
                Author          : req.body.data.author,
                Copies          : req.body.data.copies,
                CopiesLeft      : req.body.data.copies,
                RequestLimit    : req.body.data.copies,
                Category        : req.body.data.category
            }
            const create_book = await Book.create(data);
            return res
            .status(StatusCodes.OK)
            .json({message : "Books Added Successfully" , create_book});
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },
    getAllBooks : async (req,res) => {
        try{
            const books = await Book.find({});
            return res
            .status(StatusCodes.OK)
            .json({action : "ADD_BOOKS" , data : books});

        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    getSelectedBooks : async (req,res) => {
        try{
            if(req.params.category !== "All Books"){
                const books = await Book.find({Category : req.params.category});
                return res
                .status(StatusCodes.OK)
                .json({action : "ADD_BOOKS" , data : books});
            }else{
                const books = await Book.find({});
                return res
                .status(StatusCodes.OK)
                .json({action : "ADD_BOOKS" , data : books});
            } 
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    searchBooks : async (req,res) => {
        try{
            var searchWord          = req.body.data.search;
            searchWord              = searchWord[0].toUpperCase() + searchWord.slice(1,searchWord.length);      
            let bookPattern         = new RegExp("^"+searchWord);
            const searched_Books    = await Book.find({Name : {$regex : bookPattern}});
            if(searched_Books.length == 0){
                return res
                .status(StatusCodes.OK)
                .json({action : "ADD_BOOKS" , data : "NO BOOKS FOUND PLEASE ENTER CORRECT BOOK NAME"});
            }
            return res
            .status(StatusCodes.OK)
            .json({action : "ADD_BOOKS" , data : searched_Books});
        }
        catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    updateBookCopies : async (req,res) => {
        try{
            await Book.updateOne({
                _id : req.body.data._id,
            },
            {
                $inc : { 
                    Copies         : req.body.data.addCopies,
                    CopiesLeft     : req.body.data.addCopies,
                    RequestLimit   : req.body.data.addCopies
                },
            }).then(data => {
                let resData = {
                    _id : req.body.data._id,
                    inc : req.body.data.addCopies
                }
                return res
                .status(StatusCodes.OK)
                .json({action : "UPDATE_BOOK_COPIES" , data : resData});
            })
        }catch(err){
            return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    }
}