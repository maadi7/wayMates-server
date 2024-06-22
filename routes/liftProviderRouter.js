const express = require('express');
const LiftProvider = require('../models/LiftProvider');
const router = express.Router();


// Create a new lift provider
router.post('/', async (req, res) => {
    try {
        const liftProvider = new LiftProvider(req.body);
        await liftProvider.save();
        res.status(201).send(liftProvider);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all lift providers
router.get('/', async (req, res) => {
    try {
        const liftProviders = await LiftProvider.find({});
        res.send(liftProviders);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a specific lift provider by ID
router.get('/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const liftProvider = await LiftProvider.findById(_id);

        if (!liftProvider) {
            return res.status(404).send();
        }

        res.send(liftProvider);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a lift provider's details
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['vehicleType', 'vehicleNumber', 'availableSeats', 'isAvailable', 'currentLocation', 'destination'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const liftProvider = await LiftProvider.findById(req.params.id);

        if (!liftProvider) {
            return res.status(404).send();
        }

        updates.forEach((update) => liftProvider[update] = req.body[update]);
        await liftProvider.save();

        res.send(liftProvider);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a lift provider
router.delete('/:id', async (req, res) => {
    try {
        const liftProvider = await LiftProvider.findByIdAndDelete(req.params.id);

        if (!liftProvider) {
            return res.status(404).send();
        }

        res.send(liftProvider);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Search for nearby lift providers
router.get('/search/nearby', async (req, res) => {
    const { latitude, longitude, destination, distance } = req.query;

    try {
        const providers = await LiftProvider.find({
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

        res.send(providers);
    } catch (error) {
        res.status(500).send(error);
    }
});


// Save or update LiftProvider information
router.post('/save', async (req, res) => {
    const { user, currentLocation, destination } = req.body;
  
    try {
      let liftProvider = await LiftProvider.findOne({ user });
  
      if (liftProvider) {
        // Update existing LiftProvider
        liftProvider.currentLocation = currentLocation;
        liftProvider.destination = destination;
        liftProvider.updatedAt = Date.now();
      } else {
        // Create new LiftProvider
        liftProvider = new LiftProvider({ user, currentLocation, destination });
      }
  
      await liftProvider.save();
      res.status(200).json(liftProvider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


module.exports = router;
