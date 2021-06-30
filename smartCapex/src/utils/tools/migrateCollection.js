const  { MongoClient, ObjectId } = require('mongodb');



let dataLink = null
MongoClient.connect('mongodb://10.30.17.81:27017',
  {useUnifiedTopology: true },
  async (err, client) => {
    if(err){
      return 'La conexión fallo';
    }

    console.log('la conexión fue exitosa');

    // seguimos con la conexion a la colección
    const db = client.db('smart_capex')
    const db2 = client.db('palantir')

/*    await  db.collection('links').find().forEach(
       (d) => {
         db2.collection('links_Services').insertOne(d) });*/

    console.log('empezamos la transferencia');
    dataLink = await  db.collection('links_B').find({})
      .forEach((d) =>
        db2.collection('links_services_macros')
          .updateOne({
            _id: new ObjectId(d._id)
          },{
            $set: {
              "gestor": d.gestor,
              "nearEnd.x": d.nearEnd.x,
              "nearEnd.y": d.nearEnd.y,
              "farEnd.x": d.farEnd.x,
              "farEnd.y": d.farEnd.y
            },
          })
    )

    console.log('terminamos la transferencia');
  })




