var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
	summary: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false
	},
	start_time: {
		type: Date,
		required: true
	},
	end_time: {
		type: Date,
		required: true
	},
	location: {
		type: String,
		required: true
	},
	attendees: {
		type: Array,
		required: true 
	}
})

module.exports = EventSchema;