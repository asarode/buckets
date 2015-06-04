var mongoose = require('mongoose');
var Schema 	 = mongoose.Schema;

var UserSchema = new Schema({

	oauthId: String,
	
	name: String,
	
	avatarURL: String,
	
	profileURL: String,
	
	createdAt: { type: Date, default: Date.now },
	
	stargazing: [Schema.ObjectId],
	
	buckets: [Schema.ObjectId]
});

module.exports = mongoose.model("User", UserSchema);