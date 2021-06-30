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
    dataLink = await  db2.collection('links_services').find({})
      .forEach((d) =>{
          if(d.typeVisualization === 'Mayoristas'){
              db2.collection('links_services_mayoristas')
                .insertOne({...d})
          }
      }

    )

    console.log('terminamos la transferencia');
  })




