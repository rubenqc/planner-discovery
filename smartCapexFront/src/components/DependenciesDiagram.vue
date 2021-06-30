<template>
  <div class="bg-white" :class="[fullscreen ? 'q-pa-md' : '']" style="height : 100%" ref="boxMain">
    <div class="height : 100%">
      <div class="flex justify-between q-mb-md full-width">
        <div>
          <q-btn
            color="primary"
            @click="toggle"
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            :label="$q.fullscreen.isActive ? 'Salir de FullScreen' : 'Fullscreen'"
          />
        </div>
      </div>
      <network
        v-if="site"
        :style="`width: 100%; height : ${fullscreen ? '90vh': '70vh'}`"
        style="width: 100%; height : 70vh"
        ref="network"
        :nodes="nodes"
        :edges="edges"
        :options="options"
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
    </div>
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
    if (this.site) {
      this.draw(this.site);
    }
  },
  data() {
    return {
      dataResult: null,
      nodes: [],
      edges: [],
      options: null,
      fullscreen : false,
      modalCharge : false,
    };
  },
  methods: {
    draw(sinkSite) {
      this.modalCharge = true
      const hops = 15;
      fetch(`${this.LINKS_URL}/topology?sinkSite=${sinkSite}&hops=${hops}`)
        .then((res) => { res.json() })
        .catch((err) => {
          this.modalCharge = false
          console.log(err)
          this.$q.notify({
            message: 'DEPENDENCIA NO ENCONTRADO',
            color: 'negative'
          })
        })
        .then((result) => {
          console.log("-- result 2--");
          console.log(result);
          this.dataResult = result; // guardamos la información para sacar datos mas tarde
          result.nodes = result.nodes.map((n) => {
            return {
              ...n,
              shape: "dot",
            };
          });

          // dibujamos la red
          (this.nodes = result.nodes),
          (this.edges = result.edges),
            (this.options = {
              height: "100%",
              width: "100%",
              layout: {
                hierarchical: {
                  enabled: true,
                  levelSeparation: 300,
                  direction: "LR",
                  blockShifting: false,
                },
              },
            });
        });
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
  },
  computed: {
    ...mapState("links", ["LINKS_URL"]),
  },
};
</script>

<style></style>
