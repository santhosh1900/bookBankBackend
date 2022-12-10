const express            = require("express"),
      router             = express.Router(),
      BookCtrl           = require("../controller/Book"),
      AuthMiddleware     = require("../middleware/AuthMiddleware");


router.post("/addbook" , BookCtrl.createBook);

router.get("/getAllBooks" , AuthMiddleware.VerifyToken , BookCtrl.getAllBooks);

router.get("/getselectedbooks/:category" , AuthMiddleware.VerifyToken , BookCtrl.getSelectedBooks);

router.post("/searchbooks", AuthMiddleware.VerifyToken, BookCtrl.searchBooks);

router.post("/updatebookcopies", AuthMiddleware.VerifyToken, BookCtrl.updateBookCopies);

module.exports = router;