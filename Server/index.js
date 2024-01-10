const express = require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const { MongoClient,ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser=require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.json());
app.use(cookieParser());


const port = process.env.PORT || 3000;

// MongoDB connection string
const uri = 'mongodb+srv://debjitsingharoy007:O2b13SGjjeIUJ4Jg@cluster0.gdcevv7.mongodb.net/task2';

// Create a MongoDB client and connect to the database
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(cors());



const generateAuthToken = async (userId) => {
    try {
        const collection = client.db('task2').collection('userdetails');
        const token = jwt.sign({ _id: userId }, 'secretKey', {
            expiresIn: "1d"
        });

        const users = await collection.findOne({ _id: new ObjectId(userId) });
        if (!users.tokens) {
            await collection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { tokens: [] } }
            );
        }
        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { tokens: token } }
        );

        if (result.modifiedCount === 0) {
            throw new Error('User not found or token not stored');
        }
        const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });
        console.log('Updated Tokens:', updatedUser.tokens);
        return token;
    } catch (e) {
        console.log(e);
        throw new Error('Error generating authentication token');
    }
};
const authenticate=async(req,res,next)=>{
    try{
        const collective = client.db('task2').collection('userdetails');
        console.log("Token is:",req.headers.authorization);
        const token=req.headers.authorization;
        const verifyToken=jwt.verify(token,'secretKey');
        console.log("Verify:",verifyToken);
        const id=verifyToken._id;
        //console.log(id);
        //console.log("User is: ",await collective.findOne({_id:new ObjectId(id)}));
        const rootUser=await collective.findOne({_id:new ObjectId(id)});
        console.log("Root User:",rootUser);
        if(!rootUser){
            throw new Error("User not found")
        }
        req.token=token;
        req.rootUser=rootUser;
        req.userId=rootUser._id;
        //console.log(req.userId);
        next();
    }
    catch(e)
    {
        console.log(e);
        
    }
}

// Signup route
app.post('/auth/signup', async (req, res) => {
    try {
        // Access the database and userdetails collection
        const collection = client.db('task2').collection('userdetails');

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const newUser = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        };

        // Save the user to the database
        const result = await collection.insertOne(newUser);

        res.status(201).json({ message: 'User signed up successfully' });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login route
app.post('/auth/login', async (req, res) => {
    try {
        // Access the database and userdetails collection
        const collection = client.db('task2').collection('userdetails');

        // Find the user by email
        const user = await collection.findOne({ email: req.body.email });
        console.log("User is:",user);
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed. User not found.' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Authentication failed. Invalid password.' });
        }

        // Generate a JWT token
        const token = await generateAuthToken(user._id);
        res.cookie("usercookie", token, {
            expires: new Date(Date.now() + 9000000),
            httpOnly: true,
        });
        const response = {
            user,
            token
        }
        console.log("Response.token:",response.token)
        res.send({ status: 201, message: "Logged In", response });


    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Verify Token route
app.get('/verifyToken',authenticate,async (req, res) => {
    try{
        const collection = client.db('task2').collection('userdetails');
        console.log("in Index",req.rootUser._id);
        const validUserOne=await collection.findOne({_id:new ObjectId(req.rootUser._id)});
        console.log("valid User:",validUserOne);
        res.status(201).json({status:201,message:"Validated",validUserOne});
    }   
    catch(e)
    {
        res.status(401).json({status:401,message:"Unauthorized no tokens provided"});
    }
});


// Contact Us route
app.post('/contact', async (req, res) => {
    try {
        // Access the database and contactdetails collection
        const collection = client.db('task2').collection('contactdetails');

        // Create a new contact entry
        const newContact = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        };

        // Save the contact entry to the database
        const result = await collection.insertOne(newContact);

        res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
