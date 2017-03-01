var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LocationSchema   = new Schema({
    user: String,
    date: { type: Date, default: Date.now },
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2dsphere'      // create the geospatial index
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model('Location', LocationSchema);