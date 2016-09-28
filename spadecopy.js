/*
spadecopy for reading in source file and putting to another s3 location
*/
'use strict';
console.log('Loading function');

var async = require("async");
var AWS = require("aws-sdk");

var util = require("util");

var s3 = new AWS.S3();

function copyFileInAPI(srcBucket, srcKey, dstBucket, dstKey, cb) {

	async.waterfall([
		function(cb2) {
			var params = {};
			params.CopySource = srcBucket + "/" + srcKey;
			params.Bucket = dstBucket;
			params.Key = dstKey;

			s3.copyObject(params, cb2);

		},
		],

		function(error) {
			cb(error);

		}

		);


} // End of copyFileInAPI()


exports.handler = function(event, context, cb) {

	console.log("Event data: " + util.inspect(event, {depth: 5}));
    
	var srcBucket = event.Records[0].s3.bucket.name;
	var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
    var dstBucket = 'spadedest'
	var dstKey    = srcKey;

	if (srcBucket == dstBucket) {
		cb("Source and destination buckets are the same.");
		return;
	}

	var src = srcBucket + "/" + srcKey;
	var dest = dstBucket + "/" + dstKey;
	console.log(util.format("About to copy file '%s' to '%s'", src, dest));

	async.waterfall([

		function(cb2) {
			copyFileInAPI(srcBucket, srcKey, dstBucket, dstKey, cb2);
		},

	], function (error) {

		if (error) {
			console.error(util.format("ERROR: Unable to copy %s to %s. Error: %s", src, dest, error));

		} else {
			console.log(util.format("OK: Successfully copied %s to %s", src, dest));

		}

		cb(null, "message");
        
	}

)};
