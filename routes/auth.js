const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendVerificationEmail = require("../helpers/sendVerificationMail")

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, userType, verificationCode, verificationCodeExpiry } = req.body;

    // Check if the email or phone number is already registered
    const existingUser = await User.findOne({ $or: [{ email: email }, { phoneNumber: phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email or phone number is already registered" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber,
      userType: userType, // Assign userType
      isVerified: false, // Set isVerified to false by default
      verificationCode: verificationCode, // Assign verification code
      verificationCodeExpiry: verificationCodeExpiry // Assign verification code expiry
    });

    // Save the user to the database
    const user = await newUser.save();
     // Send verification email
    await sendVerificationEmail(email, firstName, verificationCode);

     // Send a success response with the user object
    

    // Send a success response with the user object
    res.status(200).send(user);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/verify", async (req, res) => {
    try {
      const { email, verificationCode } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Check if the user is already verified
      if (user.isVerified) {
        return res.status(400).json({ error: "User is already verified" });
      }
  
      // Check if the verification code matches
      if (user.verificationCode === verificationCode) {
        // Check if the verification code is expired
        const currentTime = new Date();
        if (user.verificationCodeExpiry && currentTime > user.verificationCodeExpiry) {
          return res.status(400).json({ error: "Verification code has expired" });
        }
  
        // Update user's isVerified status to true
        user.isVerified = true;
  
        // Save the updated user
        await user.save();
  
        // Send success response
        res.status(200).json({ message: "User verified successfully", user: user });
      } else {
        // Send error response if verification code does not match
        res.status(400).json({ error: "Invalid verification code" });
      }
    } catch (err) {
      // Handle errors
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


// login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ error: "Wrong password. Bad request." });
    }

    // If the email and password are valid, send the user data
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error"); // Handle other errors
  }
});


module.exports = router;
