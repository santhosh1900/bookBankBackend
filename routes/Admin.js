const express            = require("express"),
      router             = express.Router(),
      AdminCtrl          = require("../controller/Admin"),
      AuthMiddleware     = require("../middleware/AuthMiddleware");

router.get("/returnrequests", AuthMiddleware.VerifyToken, AdminCtrl.Get_Return_Requests);
router.get("/allbookbankbooks", AuthMiddleware.VerifyToken, AdminCtrl.Get_All_Book_Bank_Books);

router.put("/markasreceived", AuthMiddleware.VerifyToken, AdminCtrl.Mark_As_Received);

router.get("/listofusers", AuthMiddleware.VerifyToken, AdminCtrl.List_Of_Users);

router.post("/usershistory", AuthMiddleware.VerifyToken, AdminCtrl.Get_Users_History);


module.exports = router;