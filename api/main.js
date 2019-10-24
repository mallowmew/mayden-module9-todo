const express = require('express');
const jsonParser = require('body-parser').json();
const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = 3000;
app.listen( port, () => console.log( `Todo app listening on ${port}` ));

const mongourl = 'mongodb://mongo/';
const mongodbname = 'ma-module9';
const mongoCollection = 'tasks';

const connect = mongoClient.connect( mongourl, { useNewUrlParser: true, useUnifiedTopology: true } );

app.get( '/tasks', ( req, res ) => {
  connect
  .then( client => {
    let db = client.db( mongodbname );
    let collection = db.collection( mongoCollection );
    collection.find( { name: {$exists: true} } ).toArray()
      .then( docs => {
        res.status( 200 ).json({
          success: true,
          message: '',
          data: docs
        });
      })
      .catch( err => {
        console.log( 'Oops! ' + err );
      })
      .finally( () => {
        client.close();
      });
  })
  .catch( err => {
    console.log( 'Oops! ' + err );
  });
});

app.get( '/tasks/:id', ( req, res ) => {
  let id = ObjectId(  req.params.id  );
  mongoClient.connect( mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, ( err, client ) => {
    let db = client.db( mongodbname );
    let collection = db.collection( mongoCollection );
    collection.find({_id: id}).next( ( err, doc ) => {
      res.status( 200 ).json({
        success: true,
        message: '',
        data: doc
      });
    });
  });
});

app.post( '/tasks', jsonParser, ( req, res ) => {
  let data = req.body;
  data.completed = false;
  data.deleted = false;
  mongoClient.connect( mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, ( err, client ) => {
    let db = client.db( mongodbname );
    let collection = db.collection( mongoCollection );
    collection.insertOne( data, ( err, result ) => {
      let inserted = result.ops[0]; 
      res.status( 201 ).json({
        success: true,
        message: `Task '${inserted.name}' added with id:${inserted._id}.`,
        data: inserted // returning what you sent isn't really RESTful but can be helpful for development
      });
    });
  });
});

app.put( '/tasks', jsonParser, ( req, res ) => {
  let id = ObjectId( req.body._id );
  // This uses spread/rest to return task data without the _id - _id is an immutable field so mongodb errors instead of updating
  let { _id, ...data} = req.body; 
  mongoClient.connect( mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, ( err, client ) => {
    let db = client.db( mongodbname );
    let collection = db.collection( mongoCollection );
    collection.updateOne({_id: id}, {$set: data}, ( err, result ) => {
      res.status( 201 ).json({
        success: true,
        message: `Task with id:${id} edited.`,
        data: {}
      });
    });
  });
});

app.put( '/tasks/:id', ( req, res ) => {
  let id = ObjectId( req.params.id );
  mongoClient.connect( mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, ( err, client ) => {
    let db = client.db( mongodbname );
    let collection = db.collection( mongoCollection );
    collection.updateOne({_id: id}, {$set: {completed: true}}, ( err, result ) => {
      res.status( 201 ).json({
        success: true,
        message: `Task with id:${id} marked as completed.`,
        data: {}
      });
    });
  });
});

app.delete( '/tasks/:id', jsonParser, ( req, res ) => {
  mongoClient.connect( mongourl, {useNewUrlParser:true, useUnifiedTopology:true}, ( err, client ) => {
    let db = client.db( mongodbname );
    let collection = db.collection( mongoCollection );
    let id = ObjectId( req.params.id );
    collection.updateOne({_id: id}, {$set: {deleted:true}}, ( err, result ) => {
      res.status( 201 ).json({
        success: true,
        message: `Task with id:${id} deleted.`,
        data: {}
      });
    });
  });
});
