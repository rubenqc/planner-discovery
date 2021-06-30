const objoracle = require('oracledb');

cns = {
    user: "SISREDMW",
    password: "SISREDMW",
    connectString: "10.30.17.111/SISREDMW"
}
let cn

async  function init(){
   if(!cn){
       try {
           // objoracle.initOracleClient({libDir: 'C:\\Oracle\\instantclient'});
           cn = await objoracle.getConnection(cns)
           console.log('init')
       } catch (err) {
           console.error('Whoops!');
           console.error(err);
           process.exit(1);
       }
   }
}

function error(err,rs,cn) {
    if (err) {
        console.log("mensaje =>" + err.message) ;
        // rs.contentType('application/json') .status (500);
        // rs.send(err.message) ;
        if (cn !== null) close(cn);
        return -1;
    }
    else
        return 0;
}
async function open(sql,binds,dml,rs) {
    await init()
    const result = await cn.execute(sql,binds, {autoCommit: dml});
    return result
}

function close(cn) {
    cn.release (
        function(err) {
            if (err) { console.error(err.message); }
        }
    );
}
exports.open = open;
exports.close = close;