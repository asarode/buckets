var mongoose = require('mongoose');
var Schema 	 = mongoose.Schema;

var BucketSchema = new Schema({
	
	title: String,
	
	level: { type: String, enum: ["beginner", "intermediate", "advanced"] },
	
	links: [{
		link: String,
		title: String,
		type: { type: String, enum: ["article", "video", "repo"] }
	}],
	
	createdAt: { type: Date, default: Date.now },
	
	author: String,

	ownerId: Schema.ObjectId,
	
	stargazers: [Schema.ObjectId]
});

module.exports = mongoose.model("Bucket", BucketSchema);