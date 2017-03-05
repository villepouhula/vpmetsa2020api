var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LocationSchema   = new Schema({
    user: String,
    username: String,
    date: { type: Date, default: Date.now },
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2dsphere'      // create the geospatial index
    },
    activity: String,
    fbuser: Boolean
},
{
    timestamps: true
}
);

module.exports = mongoose.model('Location', LocationSchema);