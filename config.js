const db = require("sqlite3").verbose()
const express = require("express");
const parser = require("body-parser");

module.exports = {
	setup: {
		dbase: new db.Database("./registration.db"),
		app: express(),
		parser: parser,
		headers: function(app, parser) {
			app.use(function(req, res, next) {
			  res.header("Access-Control-Allow-Origin", "*");
			  res.header(
			    "Access-Control-Allow-Headers",
			    "Origin, X-Requested-With, Content-Type, Accept"
			  );
			  next();
			});
			app.use(parser.json());
			app.use(parser.urlencoded());
		}
	}
}