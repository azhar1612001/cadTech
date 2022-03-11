const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const express = require("express");
const app = express();
const fs = require('fs')
const multer = require('multer')
const path = require("path")
const bodyParser = require("body-parser")

dotenv.config({ path: "./config.env" });
const port = process.env.PORT || 8000;

const staticPath = path.join(__dirname, "./public");
app.set("view engine", "hbs");

app.use(express.static(staticPath));




app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.static('public'))
app.use(bodyParser.json())

var name;
var email;
var phone;
var field;
var message;
var filepath;

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./resumes");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: Storage
}).single("resume");


app.post('/carrers', (req, res) => {
    upload(req, res, function(err) {
        if (err) {
            console.log(err)
            return res.render("carrers", { error: "Something went wrong!" });
        } else {
            name = req.body.name
            email = req.body.email
            phone = req.body.phone
            field = req.body.field
            message = req.body.message
            filepath = req.file.path

            // console.log(name)
            // console.log(email)
            // console.log(phone)
            // console.log(field)
            // console.log(message)
            // console.log(req.file)
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAILID,
                    pass: process.env.GMAILPASS
                }
            });

            var mailOptions = {
                from: process.env.GMAILID,
                to: `${process.env.COMPANYGMAIL}, ${email}`,
                subject: "Visited to CAD Technologies Carrer",
                text: `
                name:${name}
                email:${email}
                phone:${phone}
                field:${field}
                message:${message}`,
                attachments: [{
                    path: filepath
                }]
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                    return res.render("carrers", { error: "Something went wrong!" });
                } else {
                    console.log('Email sent: ' + info.response);
                    fs.unlink(filepath, function(err) {
                        if (err) {
                            return res.end(err)
                        } else {
                            console.log("deleted")
                            return res.render("carrers", { success: "Message has been sent" });
                        }
                    })
                }
            });
        }
    })
})











app.get("/", (req, res) => {
    res.render("index");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/architecDesign", (req, res) => {
    res.render("architecDesign");
});

app.get("/carrers", (req, res) => {
    res.render("carrers");
});

app.get("/civilEngg", (req, res) => {
    res.render("civilEngg");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.get("/interiorDesign", (req, res) => {
    res.render("interiorDesign");
});

app.get("/structDesign", (req, res) => {
    res.render("structDesign");
});

app.post("/contact", async(req, res) => {

    const { subject, name, email, phone, message } = req.body;

    if (!subject.trim() || !name.trim() || !email.trim() || !phone.trim()) {
        res.redirect("contact", 400, { error: "Fill all the fields Properly" });
    } else if (phone.length < 10) {
        res.render("contact", { error: "Phone Number must be 10 in length" });
    } else {

        try {

            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAILID,
                    pass: process.env.GMAILPASS,
                },
            });

            let info = await transporter.sendMail({
                from: process.env.GMAILID,
                to: `${email} , ${process.env.COMPANYGMAIL}`,
                subject: subject,
                text: `
                Regarding: ${subject}
                name: ${name}
                email: ${email}
                phone: ${phone}
                message: ${message}`,
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            res.render("contact", { success: "Message has been send" });

        } catch (err) {
            console.log(err);
            res.render("contact", { error: "Some techanical error" });
        }
    }
    console.log("contact message");
});

app.listen(port, () => {
    console.log("lisening at ", port);
});