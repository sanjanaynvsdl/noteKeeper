require("dotenv").config();

const config=require('./config.json');
const mongoose=require('mongoose');
mongoose.connect(config.connectionString);

//Importing models
const User=require('./models/user.model');
const Note=require('./models/note.model');




const express=require("express");   //loads the Express library,
const cors=require("cors");         //imports the CORS middleware into application.
const app=express();                //line initializes a new Express application instance!



const jwt=require('jsonwebtoken');
const {authenticateToken}= require('./utillities');

app.use(express.json());            //Middleware that parses incoming requests with JSON payloads
app.use(                            //CORS, used specify which origins are permitted to access resources from server.
    cors({                          // allows all origins to make requests to this server.
        origin:"*"
    })
)


//Test-API-call
app.get("/",(req,res)=> {
    res.json({
        data:"Hello"
    })
});

//create-account
app.post("/create-account", async(req,res)=> {
    const {fullName, email, password} =req.body;


    //Validate-request
    if(!fullName) {
        return res
        .status(400)
        .json({
            error:true,
            message:"Full Name is required!"
        })
    }
    if(!email) {
        return res
        .status(400)
        .json({
            error:true,
            message:"Email is required!"
        });
    }
    if(!password) {
        return res
        .status(400)
        .json({
            error:true,
            message:"Password is required!"
        });
    }

    //Check if the user-exists
    const isUser= await User.findOne({email:email});

    if(isUser) {
        return res
        .status(400)
        .json({
            error:true,
            message:"User Already exists!"
        });
    }

    //Create new user
    const user=new User({
        fullName,
        email,
        password,
    });

    await user.save();
    const accessToken = jwt.sign( { user }, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "30m"
    });

    return res.json({
        error:false,
        user,
        accessToken,
        message:"User Registered successfully!!"
    });

});

//login
app.post("/login",async(req,res)=> {

    const {email, password} = req.body;

    if(!email) {
        return res
        .status(400)
        .json({
            error:true,
            message:"Email is required!"
        });
    }
    if(!password) {
        return res
        .status(400)
        .json({
            error:true,
            message:"Password is required!"
        })
    }

    const userInfo=await User.findOne({email:email});

    if(!userInfo) {
        return res
        .status(400)
        .json({
            error:true,
            message:"User not found!"
        })
    }

    if(userInfo.email==email && userInfo.password==password) {
        const user= {user:userInfo}
        const accessToken= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {
            expiresIn:"36000m",
        });

        return res.json({
            error:false,
            message:"Login Successful!",
            email,
            accessToken,
        });

    } else {

        return res
        .status(400)
        .json({
            error:true,
            message:"Invalid Credentials!"
        })
    }
});

//add-note
app.post("/add-note", authenticateToken , async(req,res)=> {
    


})



app.listen(8000);

module.exports=app;



