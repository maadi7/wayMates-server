const express = require("express");
const app = express();
const http = require('http');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:3000' } }); // Replace with your frontend URL
const authRoute = require("./routes/auth");
const liftProviderRouter = require('./routes/liftProviderRouter');
const liftSeekerRouter = require('./routes/liftSeekerRouter');
const LiftProvider = require("./models/LiftProvider");
const LiftSeeker = require("./models/LiftSeeker");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected To DB");
    app.listen(5555, () => {
      console.log(`BACKEND PORT START`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

//middleware
app.use(express.json());
app.use(cors({
  credentials:true
}));
app.use(bodyParser.json());

//routes
app.use("/api/auth/", authRoute);
app.use('/api/liftProviders', liftProviderRouter);
app.use('/api/liftSeekers', liftSeekerRouter);

const LOCATION_UPDATE_INTERVAL = 5000; // milliseconds

// Declare lastSavedLocation for each socket connection
let lastSavedLocation = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('locationUpdate', async (data) => {
    const { userId, latitude, longitude } = data;
    console.log('Received location update:', data);

    // Initialize lastSavedLocation for this socket if not already present
    if (!lastSavedLocation[socket.id]) {
      lastSavedLocation[socket.id] = 0;
    }

    // Find the LiftProvider or LiftSeeker document based on user ID
    const [liftProvider, liftSeeker] = await Promise.all([
      LiftProvider.findOne({ user: userId }),
      LiftSeeker.findOne({ user: userId }),
    ]);

    const shouldSaveLocation = !lastSavedLocation[socket.id] || (Date.now() - lastSavedLocation[socket.id]) > LOCATION_UPDATE_INTERVAL;
    if (shouldSaveLocation) {
      lastSavedLocation[socket.id] = Date.now(); // Update for logging/debugging (optional)

      if (liftProvider) {
        liftProvider.currentLocation.coordinates = [longitude, latitude];
        await liftProvider.save();
        io.emit('providerLocationUpdate', {
          userId,
          latitude,
          longitude
        });
        console.log('Updated lift provider location');
      } else if (liftSeeker) {
        liftSeeker.currentLocation.coordinates = [longitude, latitude];
        await liftSeeker.save();
        io.emit('seekerLocationUpdate', {
          userId,
          latitude,
          longitude
        });
        console.log('Updated lift seeker location');
      } else {
        console.log('User not found as LiftProvider or LiftSeeker');
      }
    } else {
      console.log('Skipping location save (recent update exists)');
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    // Clean up
    delete lastSavedLocation[socket.id];
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ........");
});
