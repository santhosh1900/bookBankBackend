const express            = require("express"),
      router             = express.Router(),
      AuthCtrl           = require("../controller/user"),
      AuthMiddleware     = require("../middleware/AuthMiddleware");

router.post("/signup", AuthMiddleware.VerifyHeader ,  AuthCtrl.RegisterUser);

router.post("/login", AuthMiddleware.VerifyHeader ,  AuthCtrl.LoginUser);

router.get("/useraddress", AuthMiddleware.VerifyToken , AuthCtrl.GetUserAddress);

router.post("/addaddress", AuthMiddleware.VerifyToken , AuthCtrl.AddAddress);

router.post ("/orderbook",  AuthMiddleware.VerifyToken , AuthCtrl.OrderBook);

router.post ("/requestbookreturn",  AuthMiddleware.VerifyToken , AuthCtrl.RequestBookReturn);

router.get("/getuserpurchasehistory", AuthMiddleware.VerifyToken , AuthCtrl.GetUserPurchaseHistory);

router.get("/getnotifications", AuthMiddleware.VerifyToken, AuthCtrl.GetNotification);



module.exports = router;