const plannerDb = require('planner-db')

const config = {
    dev: 'production',
    dbUser: "palantir",
    dbPassword: "Palantir1234",
    dbHost: "10.30.17.81",
    dbPort: "27017",
    dbName: "palantir"
}



const x = async () => {

    const { Idu, RouterLink } = await plannerDb(config)
        const result = await RouterLink.findRingsByRouterName('0105963_LM_Teatro_Vichama')
        console.log(result)

    const Instancia = "0105547_LM_Paradero_Belen to Castro Castro-17-EG6-6(FO LIM_CHQB_PAG_1 Gi0/3/5)"
    console.log("Ya traje el paquete IDU")
    console.log("Solicitando de instancia => ", Instancia)
    max = await Idu.findMaxUtilizationByInstanceAndDate(
        Instancia,
        new Date("2020-10-02 00:00")
    )
    console.log("Valor obtenido =>",max)
}

x().then(_=> {console.log("Finalizado"); process.exit(0)}).catch(err => console.log(err))

