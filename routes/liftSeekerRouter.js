const express = require('express');
const LiftSeeker = require('../models/LiftSeeker');
const router = express.Router();

// Create a new lift seeker
router.post('/', async (req, res) => {
    try {
        const liftSeeker = new LiftSeeker(req.body);
        await liftSeeker.save();
        res.status(201).send(liftSeeker);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all lift seekers
router.get('/', async (req, res) => {
    try {
        const liftSeekers = await LiftSeeker.find({});
        res.send(liftSeekers);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a specific lift seeker by ID
router.get('/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const liftSeeker = await LiftSeeker.findById(_id);

        if (!liftSeeker) {
            return res.status(404).send();
        }

        res.send(liftSeeker);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a lift seeker's details
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['currentLocation', 'destination', 'requestedSeats', 'isMatched', 'matchedProvider'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const liftSeeker = await LiftSeeker.findById(req.params.id);

        if (!liftSeeker) {
            return res.status(404).send();
        }

        updates.forEach((update) => liftSeeker[update] = req.body[update]);
        await liftSeeker.save();

        res.send(liftSeeker);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a lift seeker
router.delete('/:id', async (req, res) => {
    try {
        const liftSeeker = await LiftSeeker.findByIdAndDelete(req.params.id);

        if (!liftSeeker) {
            return res.status(404).send();
        }

        res.send(liftSeeker);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Search for nearby lift seekers
router.get('/search/nearby', async (req, res) => {
    const { latitude, longitude, destination, distance } = req.query;

    try {
        const seekers = await LiftSeeker.find({
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: distance ? parseInt(distance) : 10000 // Default 10 km
                }
            },
            destination
        });

        res.send(seekers);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Save or update LiftSeeker information
router.post('/save', async (req, res) => {
    const { user, currentLocation, destination } = req.body;
  
    try {
      let liftSeeker = await LiftSeeker.findOne({ user });
  
      if (liftSeeker) {
        // Update existing LiftSeeker
        liftSeeker.currentLocation = currentLocation;
        liftSeeker.destination = destination;
        liftSeeker.updatedAt = Date.now();
      } else {
        // Create new LiftSeeker
        liftSeeker = new LiftSeeker({ user, currentLocation, destination });
      }
  
      await liftSeeker.save();
      res.status(200).json(liftSeeker);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


module.exports = router;
