/**
 * JournalAPI
 *
 * An API for storing journal entries along with
 * location data, mood data, and weather data.
 *
 * This file handles all the journal entry information routes,
 * and should enable our users to create update, get, and delete
 * their entries.
 *
 * CIS 371 - Fall 2021
 *
 */

/**********
 * Load all the libraries we need.
 **********/

var express = require('express');
var router = express.Router();
var user = require('./users.js');
var checkAuth = user.checkAuth;

/**
 * Create the schemas we will need.
 * Point is just a GEOJson lat/long coordinate.
 * Entry is a journal entry.
 */

// Pull in the mongoose library
const mongoose = require('mongoose');
const { Schema } = mongoose;

const pointSchema = new Schema({
	type: {
		type: String,
		enum: ['Point'],
		required: true
	},
	coordinates: {
		type: [Number],
		required: true
	}
});

const entrySchema = new Schema({
	userId: mongoose.ObjectId,
        date: {
		type: Date,
		default: Date.now
	},
	mood: {
		type: String,
		required: true
	},
	entry: {
		type: String,
		required: true
	},
	location: {
		type: pointSchema,
		required: true
	},
	weather: String
});

// Really don't need the one for Point, but eh...
const Point = mongoose.model('Point', pointSchema);
const Entry = mongoose.model('Entry', entrySchema);

/* GET full entry listing for logged in user. */
router.get('/getAllEntries', async function(req, res, next) {
	if (!req.user){
		return res.redirect("/")
	}
	var entries = await Entry.find({ userId: req.user._id });
	res.status(200);
	res.json(entries);
});

/**
 * Get single entry for logged in user
 */

router.get('getEntry/:entryId', checkAuth, async function(req, res, next){
	var entry = await Entry.findOne({
		_id : req.params.entryId
	});
	if(entry.userId == req.user._id || req.user.admin == true){
		res.json(entry);
	} else {
		var error = new Error("Not found.");
		error.status = 404;
			throw error;
	}
});

/**
 * Allow logged in user to create new entry.
 */
router.get('/addView', async function(req, res, next){
	res.render('addEntry');
});

router.get('/editView', async function(req, res, next){
	res.render('editEntry');
	// how to get entry_id??
});

router.post('/updateView', async function(req, res, next){
	let entry = JSON.parse(req.body.entry)
	res.render('editEntry', {e : entry});
});

// router.post('/', async function(req, res, next){
// 	if(!(req.body.entry && req.body.mood && req.body.location)){
// 		var error = new Error('Missing required information.');
// 		error.status = 400;
// 		throw error;
// 	}
// 	var entry = new Entry({
// 		userId: req.user._id,
// 		entry: req.body.entry,
// 		mood: req.body.mood,
// 		location: req.body.location
// 	});
// 	entry.save();
// 	res.status(200).send("Entry saved.");
// });

router.post('/', async function(req, res, next){
	if(!req.user) {
		return res.redirect('/');
	}

	if (req.body.entry && req.body.mood) {
		loc = req.body.location.split(':')

		var entry = new Entry({
			userId: req.user._id,
			entry: req.body.entry,
			mood: req.body.mood,
			location: new Point({
				type: 'Point',
				coordinates: [parseFloat(loc[0]), parseFloat(loc[1])]
			}),
			weather: req.body.weather
		})
		let saved_entry = await entry.save();
	}
	const entries = await Entry.find({userId: req.user._id});
	return res.render('journal', {entries: entries});
});


/**
 * Allow a user to modify their own entry.
 */
router.post('/edit', async function(req, res, next){
	if (!req.user){
		return res.redirect("/")
	}

	var entry = await Entry.findOne({
		userId : req.user._id,
		_id : req.body.entryId
	});

	if(!entry){
		var error = new Error('Entry not found.');
		error.status = 404;
		throw error;
	}

	if(!(req.body.entry && req.body.mood && req.body.location && req.body.weather)){
		console.log(req.body);
		var error = new Error('Missing required information.');
		error.status = 400;
		throw error;
	}

	entry.entry = req.body.entry;
	entry.mood = req.body.mood;
	entry.location = JSON.parse(req.body.location);
	entry.weather = req.body.weather;
	updatedEntry = await entry.save();
	const entries = await Entry.find({userId: req.user._id});
	return res.render('journal', {entries: entries});
});

/**
 * Allow a user to delete one of their own entries.
 */
router.post('/delete', async function(req, res, next){
	if (!req.user){
		return res.redirect("/")
	}
	const entry = await Entry.deleteOne({
		userId : req.user._id,
		_id : req.body.entryId
	});
	console.log(req.user._id)
	console.log(req.body)
	console.log(req.body.entryId)
	if(!entry){
		console.log("Hi")
		return res.render('/');
		next();
	}else{
		const entries = await Entry.find({userId: req.user._id});
		return res.render('journal', {entries: entries});
	}
});

module.exports = { router, Entry };
