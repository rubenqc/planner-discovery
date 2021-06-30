<template>
  <div class="q-pa-lg" style="max-width : 90vw">
    <q-table
      style="width : 100%"
      title="Enlaces"
      :data="data"
      :columns="columns"
      row-key="_id"
      :loading="loading"
      @request="onRequestPaginate"
      :pagination.sync="pagination"
      binary-state-sort
      class="my-sticky-column-table"
    >
<!--     Por el momento solo son visuales los botones de ayuda-->
      <template v-slot:top>
        <q-btn
          color="primary"
          :disable="loading"
          label="Registar Enlace"
          @click="modalCreate = true"
          class="q-mr-md"
        />
        <q-btn
          color="primary"
          :disable="loading"
          label="Limpiar Busqueda"
          @click="clearInputs"
          class="q-mr-md"
        />
        <!--REVISAR METODO DE DESCARGA AL FINAL-->
<!--        <q-btn-->
<!--          color="primary"-->
<!--          :disable="loading"-->
<!--          label="Descargar data"-->
<!--          @click="download"-->
<!--        />-->
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>Opciones</q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>

            <q-btn
              size="sm"
              color="positive"
              round
              dense
              icon="create"
              @click="openEditform(props.row)"
              class="q-mr-sm"
            />
            <q-btn
              size="sm"
              color="negative"
              round
              dense
              icon="close"
              @click="openDeleteModal(props.row)"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">{{ col.value }}</q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props" class="col-">
          <q-td colspan="100%" style="padding-left : 0">
            <DetailLink :link="props.row" :key="props.row._id"/>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:bottom-row>
        <q-tr>
          <q-td auto-width />
          <q-td v-for="col in columns" :key="col.name" auto-width>
            <q-input
              v-if=true
              dense
              filled
              style="min-width : 140px"
              v-model="body[col.name]"
              @input="updateInput($event, col.name)"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="modalCharge" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Cargando</div>
        </q-card-section>

        <q-card-section class="q-pt-none flex column items-center justify-center">
          <q-spinner-bars color="primary" size="5.5em" />
          <p>por favor no cierre la pestaña.</p>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalError" position="top" seamless persistent>
      <q-card>
        <q-card-section class="text-red">
          Al parecer hubo un error realizando la operación
          <q-icon name="warning" class="text-red" style="font-size: 2rem;" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalOk" position="top" seamless persistent>
      <q-card>
        <q-card-section class="text-green-5">
          Operación Realizada con exito
          <q-icon name="check_circle" class="text-green-5" style="font-size: 2rem;" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalConfirmDelete" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Estás seguro de que deseas eliminar este enlace?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Confirmar" color="primary" @click="deleteLink"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- //Formulario de Creación  -->

    <FormCreate
      :layout="modalCreate"
      @onClose="modalCreate = false"
      @onSuccess="alertar(false)"
      @onError="alertar(true)"
    />

    <!-- Formulario de Editar -->
    <FormEdit
      :layout="modalEdit"
      :form="linkEdit"
      @onClose="modalEdit = false"
      @onSuccess="alertar(false)"
      @onError="alertar(true)"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";
import moment from 'moment'
import FormCreate from "./formCreateLink";
import FormEdit from "./formEditLink";
import DetailLink from "./DetailLink";
export default {
  name: "MainSiteTable",
  components: {
    FormCreate,
    DetailLink,
    FormEdit,
  },
  data() {
    return {
      select: {
        statusOptions: [
          "Todos",
          "danger",
          "warning",
          "ok",
          "observado",
          "sin-instancia",
        ],
        mediaOptions: ["Todos", "BH", "LH", "FO","RENTADO-FO"],
      },
      typing: null,
      body: {
        siteName: null,
        coordX: null,
        coordY: null,
        agg: null,
      },
      loading: true,
      pagination: {
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 0,
       /* sortBy : 'utilization',
        descending : false*/
      },
      columns: [
        {
          name: "siteName",
          label: "Site Name",
          field: (row) => row.siteName,
          align: "left",
          sortable : true
        },
        {
          name: "agg",
          label: "Agregador",
          field: (row) => row.agg,
          sortable : true
        },
        {
          name: "coordX",
          label: "Longitud",
          field: (row) => row.coordX,
          sortable : true
        },
        {
          name: "coordY",
          label: "Latitud",
          field: (row) => row.coordY,
          sortable : true
        },


      ],
      data: [],

      //Modal Carga de Archivos
      modalFile: false,
      modalCharge: false,
      file: null,

      //Modal Formulario
      modalCreate: false,
      modalEdit: false,
      modalError: false,
      modalOk: false,
      modalConfirmDelete : false,

      //data enviada a form edit
      linkEdit: null,
      linkDelete : null
    };
  },
  created() {
    const body = this.bodyBuilder(this.pagination);
    console.log("-------body inicial----------")
    console.log(body)
    this.getData(body);
  },
  methods: {
    // obtener datos del servidor, recibe el this.body con la paginacion y el query de busqueda
    async getData(body = {}) {

      const response = await this.$axios.post(`${this.SITES_URL}/getAllSite`, {
        ...body,
      });

      console.log("***** imprimiendo result de getData*********")
      console.log(response)

     /* this.data.splice(0, this.data.length, ...response.data.docs);*/
      this.pagination.page = response.data.page;
      this.pagination.rowsPerPage = response.data.limit;
      this.pagination.rowsNumber = response.data.totalDocs;
      this.data = []
      console.log(this.pagination)
      response.data.docs.forEach((row) => {

          this.data.push({
            siteName: row.siteName || "",
            agg: row.agg || "",
            coordX: row.geometry ? row.geometry.coordinates[0] : "",
            coordY: row.geometry ? row.geometry.coordinates[1] : "",
          })

      })

      console.log(this.data)
      this.pagination.sortBy = undefined
      this.pagination.descending = undefined
      this.loading = false;
      return "ok";
    },

    //solicitar una pagina especifica de la collecion en el servidor
    onRequestPaginate(props) {
      this.loading = true;
      props.pagination.descending = !props.pagination.descending
      const body = this.bodyBuilder(props.pagination, this.body);
      this.getData(body);
      this.pagination.descending = !props.pagination.descending
    },

    //Metodo que genera un objeto enviado al server
    bodyBuilder(pagination, fields) {
      console.log("--------- Imprimiendo pagination en builder--------")
      console.log(pagination)

      /*if(pagination.sortBy && pagination.descending === true){
        pagination.sort = 'utilization'
      }else if(pagination.sortBy && pagination.descending === false){
        pagination.sort = '-utilization'
      }*/
      // //----------------
      if (fields) {
        return {
          pagination,
          fields,
        };
      } else {
        return {
          pagination,
        };
      }
    },

    //Metodos que actualizan el this.body, realizan una peticion y luego actualizan la tabla
    updateInput(value, name) {
      this.loading = true;
      clearTimeout(this.typing);
      this.typing = setTimeout(() => {
        this.body[name] = value;
        const body = this.bodyBuilder(this.pagination, this.body);
        this.getData(body);
      }, 500);
    },

    updateSelectStatus(value) {
      this.loading = true;
      this.body.status = value;
      const body = this.bodyBuilder(this.pagination, this.body);

      this.getData(body);
    },

    updateSelectMedia(value) {
      this.loading = true;
      this.body.media = value;
      const body = this.bodyBuilder(this.pagination, this.body);

      this.getData(body);
    },

    //Metodo que reinicia la tabla
    clearInputs() {
      this.body = {
        siteName: null,
        longitud: null,
        latitud: null,
        agregador: null,
      };

      this.pagination = {
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 0,
        /*sortBy : 'utilization',
        descending : false*/
      };

      const body = this.bodyBuilder(this.pagination);

      this.getData(body);
    },

    //METODO QUE CAMBIA LA DATA DEL DIALOG Y LUEGO LO MUESTRA
    openModal(data) {
      console.log(data);
      this.dataModal = data;
      this.modalOpen = true;
    },

    //metodo que envia Excel

    //metodo que muestra una alerta y lo cierra 3 segundos despues
    async alertar(error) {
      this.modalCreate = false;
      this.modalEdit = false;
      if (error) {
        this.modalError = true;
        setTimeout(() => {
          this.modalError = false;
        }, 3000);
      } else {
        this.modalOk = true;
        const body = this.bodyBuilder(this.pagination);
        await this.getData(body);
        setTimeout(() => {
          this.modalOk = false;
        }, 3000);
      }
    },


    //Metodo que elimina un documento
    async deleteLink() {
      const { _id } = this.linkDelete
      this.modalCharge = true;
      const response = await this.$axios.delete(
        `${this.LINKS_URL}/${_id}/deleteLink`,
        {
          enlace: this.linkDelete,
        }
      );
      const body = this.bodyBuilder(this.pagination);
      await this.getData(body);
      this.modalCharge = false;
      this.modalConfirmDelete = false;
      return;
    },

    //metodo que muetra el formulario editar
    openEditform(link) {
      this.linkEdit = link;
      this.modalEdit = true;
    },

    openDeleteModal(link){
      this.linkDelete = link
      this.modalConfirmDelete = true
    },

    // Download la data de sites ( AL FINAL )
    download(){
      window.open(`${this.LINKS_URL}/getData`,'_blank')
    },

/*    processUtilization(row){
      if(row.utilizationHistory && row.utilizationHistory.length > 0){

        let result = "";
        // const lastFourLogs = row.utilizationHistory.slice(-4)
        // console.log(lastFourLogs)
        // lastFourLogs.forEach((log) => {
        //   result += `${log.maxUtilization.toFixed(2)}/`
        // })
        // result = result.slice(0, -1)
        // return result
        const month = [
          moment().month(),
          moment().subtract(1,'months') .month(),
          moment().subtract(2,'months') .month(),
          moment().subtract(3,'months') .month()
        ]
        for(let i = 0; i < 4 ; i++){
          result += ` ${this.getMaxUtilizationbyMonth(row.utilizationHistory,month[i])} `
        }
        return result
      }
      return ""
    },*/

   getMaxUtilizationbyMonth(history,month){
      const filtered = history.filter(log => moment(log.date).month() == month)
      const result = filtered.sort((a,b) => b.maxUtilization - a.maxUtilization)

      return ""
    }
  },
  computed: {
    ...mapState("links", ["SITES_URL"]),
  },
};
</script>


<style scoped>

</style>
