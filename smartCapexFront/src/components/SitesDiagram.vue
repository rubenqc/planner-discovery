<template>
  <div class="bg-white" :class="[fullscreen ? 'q-pa-md' : '']" style="height : 100%" ref="boxMain">
    <div class="flex justify-between q-mb-md full-width">
      <!--      Add count of sites    -->
      <div  v-if="loading">Cargando conteo de sites</div>
      <div v-else class="sitesCount">
        <q-table
          title="Cantidad de Sites"
          :data="data"
          :columns="columns"
          hide-bottom
        >
        </q-table>
      </div>
      <!--      End count of sites    -->
      <div class="flex"  style="width:450px; margin: 16px;">
        <div class="flex items-center q-mr-lg">
          <img style="height: 2rem" src="../assets/n.png" alt="">
          <span>&nbsp; Cargar NE</span>
        </div>
        <div class="flex items-center q-mr-lg">
          <img style="height: 2rem" src="../assets/network.svg" alt="">
          <span>&nbsp; Cargar FE</span>
        </div>
        <div class="flex items-center q-mr-lg">
          <img style="height: 2rem" src="../assets/fn.png" alt="">
          <span>&nbsp; Cargar FE y NE</span>
        </div>
        <div class="flex column q-mt-sm "><div class="flex items-center"><span>ENLACE FO &nbsp;&nbsp;&nbsp;</span><div style="height: 3px; width: 50px; border: 2px solid rgb(72, 232, 240); display: inline-block;"></div></div><div class="flex items-center"><span>ENLACE MW &nbsp;</span><div style="height: 3px; width: 50px; border: 2px dashed rgb(255, 152, 0); display: inline-block;"></div></div></div>
      </div>
      <div>
        <q-btn
          color="primary"
          label="Limpiar"
          icon="autorenew"
          class="q-mr-md"
          @click="onReset"
        />
        <q-btn
          color="primary"
          label="Editar"
          icon="edit"
          class="q-mr-md"
          @click="editOn"
        />
        <q-btn
          color="primary"
          label="Guardar"
          icon="save"
          class="q-mr-md"
          @click="savePositions"
        />
        <q-btn
          color="primary"
          @click="toggle"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
          :label="$q.fullscreen.isActive ? 'Salir de FullScreen' : 'Fullscreen'"
        />
      </div>
    </div>
    <network
      v-if="loadsites"
      :style="`width: 100%; height : ${fullscreen ? '90vh': '70vh'}`"
      ref="network"
      :nodes="nodes"
      :edges="edges"
      :options="options"
      :events="['click','hoverNode','blurNode']"
      @click="loadNodes"
      @hover-node="onHover"
      @blur-node="onBlur"
    ></network>
    <div v-else>
      Por favor seleccione un site
    </div>

    <q-dialog v-model="modalCharge" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Cargando</div>
        </q-card-section>
        <q-card-section class="q-pt-none flex column items-center justify-center">
          <p>por favor no cierre la pestaña.</p>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-if="dataRouter" v-model="seamless" seamless position="bottom">
      <q-card style="width: 350px">

        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold">{{dataRouter.site}}</div>
            <div v-for="(routerName,index) in dataRouter.routerNames" :key="index">{{routerName}}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Network } from "vue-vis-network";
import { mapState } from "vuex";

export default {
  props: {
    site: String,
  },
  components: {
    Network,
  },
  created() {

  },
  data() {
    return {
      loading: true,
      columns: [
        {
          name: 'tipo',
          required: true,
          label: 'Type',
          align: 'left',
          field: row => row.tipo,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'amount', align: 'center', label: 'Cantidad', field: 'amount', sortable: true }
      ],
      data: [],
      // I SHOULD CHANGE DATA
      dataResult: null,
      nodes: [],
      edges: [],
      options: null,
      onEdit : false,
      modalCharge : false,
      loadsites : false,
      fullscreen : false,
      seamless : false,
      dataRouter : null
    };
  },
  mounted() {
    if (this.site) {
      this.draw(this.site);
    }
    console.log('previous mounted')
    this.$axios.get(`${this.LINKS_URL}/getLinkTypesCounts`).
    then(response =>{
      this. data = [
        {
          tipo: 'BH',
          amount: response.data.result["BH"],
        },
        {
          tipo: 'LH',
          amount:  response.data.result["LH"],
        },
        {
          tipo: 'FO',
          amount: response.data.result["FO"],
        },
        {
          tipo: 'RENTADO-FO',
          amount: response.data.result["RENTADO-FO"]  || 0,
        },
      ]
    } ).finally(() => this.loading = false)},

  methods: {
    draw(site) {
      console.log(this.modalCharge)
      this.modalCharge = true
      this.loadsites = true
      fetch(`${this.LINKS_URL}/getTophBySite?site=${site}`)
      // fetch(`${this.LINKS_URL}/getToph`)
        .then((res) => res.json())
        .catch((err) => console.log(err))
        .then((result) => {
          this.dataResult = result; // guardamos la información para sacar datos mas tarde
          result.nodes = result.nodes.map((n) =>{
            const toFeCant = result.edges.filter(edge => edge.to === n.id).length
            const fromNeCant = result.edges.filter(edge => edge.from === n.id).length
            const {feCant,neCant} = n
            // console.log(n.label, `NELOAD/FELOAD : ${fromNeCant}/${neCant} --- ${toFeCant}/${feCant}`)
            const {image, loadtype} = this.calcuteImage({
                neLoad : fromNeCant,
                feLoad : toFeCant,
                feCant : feCant,
                neCant : neCant
              })
            let isAllgraphic = false
            if(toFeCant === feCant && fromNeCant === neCant){
              isAllgraphic = true
            }
            return {
              ...n,
              image,
              loadtype,
              shape: isAllgraphic ? "dot" : "circularImage",
              isAllgraphic
            };
          });
          // dibujamos la red
          (this.nodes = result.nodes),
          (this.edges = result.edges),
          (this.options = {
              // physics: {
              //   forceAtlas2Based: {
              //     gravitationalConstant: -26,
              //     centralGravity: 0.005,
              //     springLength: 230,
              //     springConstant: 0.18,
              //   },
              //   maxVelocity: 1000,
              //   solver: "forceAtlas2Based",
              //   timestep: 0.35,
              //   stabilization: { iterations: 150 },
              // },
              physics : false,
              interaction : {
                dragNodes : false,
                hover : true
              },
              edges : {
                smooth: {
                  enabled: true,
                  type: "curvedCW",
                  roundness: 0.2
                },
                // smooth : true,
                arrows : 'from'
              }
            });
          setTimeout(_=>{
            console.log(this.modalCharge,"2")
            this.modalCharge = false
            this.$refs.network.focus(1)
          }, 100)
        });
    },
    editOn(){
      this.options.interaction.dragNodes = true
      this.onEdit = true
    },
    async savePositions(){
      const positions = this.$refs.network.getPositions()
      const _nodes = this.nodes.map((node) => {
        return {
          id : node.id,
          label : node.label,
          x : positions[""+node.id].x,
          y : positions[""+node.id].y
        }
      })
      const dialog = this.$q.dialog({
        title: 'Actualizando',
        message: 'Un momento por favor',
        ok : false
      })

      const response = await this.$axios.patch(`${this.LINKS_URL}/updatePositions`,{
        nodes : _nodes
      })
      if(response.status === 200){
        console.log(response.data)
        this.options.interaction.dragNodes = false
        this.onEdit = false
        dialog.hide()
      }else{
        console.warn(response.data)
      }
    },
    async loadNodes(e){
      if(e.nodes.length > 0 && !this.onEdit){
        const node = this.$refs.network.getNode(e.nodes[0])
        if(!node.isAllgraphic && node.loadtype === 'nearends'){
          console.log("nearEnds")
          this.modalCharge = true
          //Trayendo nearEnds
          this.nodes.map(function(item) {
            delete item.isAllgraphic;
            delete item.shape;
            delete item.image;
            delete item.loadtype
            return item;
          });
          const response = await this.$axios.post(`${this.LINKS_URL}/getDependecies`,{
            nodes : this.nodes,
            edges : this.edges,
            site :  node.label
          })
          this.nodes = response.data.nodes.map((n) => {
            const toFeCant = response.data.edges.filter(edge => edge.to === n.id).length
            const fromNeCant = response.data.edges.filter(edge => edge.from === n.id).length
            const {feCant,neCant} = n
            console.log(n.label, `NELOAD/FELOAD : ${fromNeCant}/${neCant} --- ${toFeCant}/${feCant}`)
            const {image, loadtype} = this.calcuteImage({
              neLoad : fromNeCant,
              feLoad : toFeCant,
              feCant : feCant,
              neCant : neCant
            })
            let isAllgraphic = false
            if(toFeCant === feCant && fromNeCant === neCant){
              isAllgraphic = true
            }
            return {
              ...n,
              image,
              loadtype,
              shape: isAllgraphic ? "dot" : "circularImage",
              isAllgraphic
            };
          })
          this.edges = response.data.edges

          setTimeout(_=>{
            this.modalCharge = false
            this.$refs.network.focus(e.nodes[0])
            this.$refs.network.selectNodes([e.nodes[0]])
          },100)
        }
        else if(!node.isAllgraphic && node.loadtype === 'farends'){
          console.log("Farends")
          this.modalCharge = true
          //Trayendo farEnds
          this.nodes.map(function(item) {
            delete item.isAllgraphic;
            delete item.shape;
            delete item.image;
            delete item.loadtype
            return item;
          });
          const responseFe = await this.$axios.post(`${this.LINKS_URL}/getFarEnds`,{
            nodes : this.nodes,
            edges : this.edges,
            site :  node.label
          })
          this.nodes = responseFe.data.nodes.map((n) => {
            const toFeCant = responseFe.data.edges.filter(edge => edge.to === n.id).length
            const fromNeCant = responseFe.data.edges.filter(edge => edge.from === n.id).length
            const {feCant,neCant} = n
            console.log(n.label, `NELOAD/FELOAD : ${fromNeCant}/${neCant} --- ${toFeCant}/${feCant}`)
            const {image, loadtype} = this.calcuteImage({
              neLoad : fromNeCant,
              feLoad : toFeCant,
              feCant : feCant,
              neCant : neCant
            })
            let isAllgraphic = false
            if(toFeCant === feCant && fromNeCant === neCant){
              isAllgraphic = true
            }
            return {
              ...n,
              image,
              loadtype,
              shape: isAllgraphic ? "dot" : "circularImage",
              isAllgraphic
            };
          })
          this.edges = responseFe.data.edges

          setTimeout(_=>{
            this.modalCharge = false
            this.$refs.network.focus(e.nodes[0])
            this.$refs.network.selectNodes([e.nodes[0]])
          },100)
        }
        else if(!node.isAllgraphic && node.loadtype === 'both'){
          console.log("Ambos")
          this.modalCharge = true
          //Trayendo nearEnds
          this.nodes.map(function(item) {
            delete item.isAllgraphic;
            delete item.shape;
            delete item.image;
            delete item.loadtype
            return item;
          });
          const response = await this.$axios.post(`${this.LINKS_URL}/getDependecies`,{
            nodes : this.nodes,
            edges : this.edges,
            site :  node.label
          })
          this.nodes = response.data.nodes
          this.edges = response.data.edges

          //Trayendo farEnds
          const responseFe = await this.$axios.post(`${this.LINKS_URL}/getFarEnds`,{
            nodes : this.nodes,
            edges : this.edges,
            site :  node.label
          })
          this.nodes = responseFe.data.nodes.map((n) => {
            const toFeCant = responseFe.data.edges.filter(edge => edge.to === n.id).length
            const fromNeCant = responseFe.data.edges.filter(edge => edge.from === n.id).length
            const {feCant,neCant} = n
            console.log(n.label, `NELOAD/FELOAD : ${fromNeCant}/${neCant} --- ${toFeCant}/${feCant}`)
            const {image, loadtype} = this.calcuteImage({
              neLoad : fromNeCant,
              feLoad : toFeCant,
              feCant : feCant,
              neCant : neCant
            })
            let isAllgraphic = false
            if(toFeCant === feCant && fromNeCant === neCant){
              isAllgraphic = true
            }
            return {
              ...n,
              image,
              loadtype,
              shape: isAllgraphic ? "dot" : "circularImage",
              isAllgraphic
            };
          })
          this.edges = responseFe.data.edges

          setTimeout(_=>{
            this.modalCharge = false
            this.$refs.network.focus(e.nodes[0])
            this.$refs.network.selectNodes([e.nodes[0]])
          },100)
        }
      }
    },
    calcuteImage({neLoad,feLoad,feCant,neCant}){
      if(neLoad === neCant && feLoad !== feCant){
        return {
          image : require('assets/network.svg'),
          loadtype : 'farends'
        }
      }
      else if(neLoad !== neCant && feLoad === feCant){
        return {
          image : require('assets/n.png'),
          loadtype : 'nearends'
        }
      }
      else if(neLoad !== neCant && feLoad !== feCant){
        return {
          image : require('assets/fn.png'),
          loadtype : 'both'
        }
      }
      else if(neLoad === neCant && feLoad === feCant){
        return {
          image : undefined,
          loadtype : undefined
        }
      }
    },
    onReset(){
      this.$emit('reset')
    },
    toggle (e) {
      // const target = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
      this.$q.fullscreen.toggle(this.$refs.boxMain)
        .then(() => {
          // success!
        })
        .catch((err) => {
          alert(err)
          // uh, oh, error!!
          // console.error(err)
        })
    },
    onHover(e){
      const node = this.$refs.network.getNode(e.node)
      if(node.dataRouter){
        this.dataRouter = {
          ...node.dataRouter,
          site : node.label
        }
        this.seamless = true
      }
    },
    onBlur(e){
      const node = this.$refs.network.getNode(e.node)
      if(node.dataRouter){
        this.seamless = false
      }
    }
  },
  computed: {
    ...mapState("links", ["LINKS_URL"]),
  },
  watch: {
    site(val){
      if(val){
        const search = this.nodes.filter(node => node.label === val)
        if(search.length > 0){
           this.$refs.network.focus(search[0].id);
           this.$refs.network.selectNodes([search[0].id])
        } else{
          this.draw(val);
        }
      }
    },
    '$q.fullscreen.isActive' (val) {
      this.fullscreen = val
    }
  }
};
</script>

<style>
.sitesCount .q-table__container{
  margin-right: 16px;
  margin-bottom: 16px;
}

.sitesCount .q-table__top {
  padding: 2px 16px;
}

.sitesCount .q-table__title {
  font-size: 14px;
  font-weight: bold;
}

.sitesCount  th,
.sitesCount  td {
  padding: 1px 16px;
  background-color: inherit;
}
.sitesCount thead tr,
.sitesCount  tbody td {
  height: 14px;
}

.sitesCount  thead {
  display: none;
}
</style>
