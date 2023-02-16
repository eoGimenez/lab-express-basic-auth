const router = require("express").Router();
const bcrypt = require("bcryptjs");
const saltRounds = 8;

const User = require("../models/User.model")

const isLogged = require("../middleware/isLogged");
const isNotLogged = require("../middleware/isNotLogged")


router.get("/login",  isNotLogged, (req, res, next) => {
    //console.log("usuario: ", req.session.currentUser)
    res.render("users/login");
})

router.post("/login", isNotLogged, (req, res, next) => {
    let {username, password} = req.body;
    //console.log("desde el post de login", req.body)
    if (username == "" || password == "") {
        res.render("users/login", {menssage : "Some fields are empty, please check them !"})
    }
    User.find({username})
    .then(result => {
        console.log("en el then del  find del login")
        if (result.length == 0) {
            res.render("users/login", {menssage : "Username or Password are incorrect, check them please!"})
            //console.log("entro en el if de comprobar si existe")
            return;
        }
        if (bcrypt.compareSync(password, result[0].password)) {
            //console.log("entro en la comparacion de contraseñas")
            req.session.currentUser = username;
            res.redirect("/user/private")
        } else {
            res.render("users/login", {menssage : "Username or Password are incorrect, check them please!"})
        }
    })
    .catch(err => next(err))
})

router.get("/logout", isLogged, (req, res, next) => {
    //console.log("usuario:",req.session.currentUser)
    req.session.destroy((err) => {
        if (err) next(err);
        else res.render("users/main" );
      });
})


router.post("/singin", isNotLogged, (req, res, next) => {
    let {username, password, passwordConfirm} = req.body;
    //console.log("desde post de singin")
    if (username == "" || password == "" || passwordConfirm == "") {
        res.render("users/singin", {menssage : "Some fields are empty, please check them !"});
        return;
    } else if (password != passwordConfirm) {
        res.render("users/singin", {message: "The password and the confirmation of the password are not equals, please chem them !"})
        return;
    }
    //console.log("antes del find")
    User.find({username})
    .then(result => {
        if (result.length != 0) {
            res.render("users/singin", {message: "This 'Username' is already in use, please try to pick other one, Thank!"});
            return;
        }
        let salt = bcrypt.genSaltSync(saltRounds);
        let passCrypted = bcrypt.hashSync(password, salt);

        User.create({
            username,
            password: passCrypted
        })
        .then(result => {
            res.redirect("/user/login")
        })
    })
    .catch(err => next(err))

    
})
router.get("/private", isLogged, (req, res, next) => {
    //console.log("entra el renderizado de private OK")
    res.render("users/private", { username : req.session.currentUser });
})

router.get("/main", isNotLogged, (req, res, next) => {
    res.render("users/main");
  })
  
router.get("/singin", isNotLogged, (req, res, next) => {
    res.render("users/singin");
})

module.exports = router;