<template>
  <q-page class="flex column flex-center">
    <div class="flex justify-between q-my-md items-start" style="width : 90%">
      <h1 class="h1" style="vertical-align: top;line-height: 1;">Diagramas de Sitios</h1>
      <q-select
        v-if="true"
        filled
        v-model="site"
        clearable
        hide-selected
        fill-input
        use-input
        input-debounce="0"
        label="Nombre del site"
        hint="Mínimo 3 carácteres"
        :options="options"
        @filter="filterFn"
        style="width: 350px"
        @input="changeVisData"
      >
      </q-select>
      <q-skeleton v-else type="QInput" style="width: 350px" />
    </div>
    <div style="width : 90%; height :70vh" class="q-mb-xl">
      <VisConponent :site="site" :key="visKey" @reset="reset" />
    </div>
  </q-page>
</template>

<script>
import VisConponent from "components/SitesDiagram";
import { mapState } from 'vuex'
export default {
  components: {
    VisConponent,
  },
  created() {
  },
  name: "PageDiagramComplex",
  data() {
    return {
      model: null,
      options:['Escribe 3 caracteres'],
      original : null,
      site: null,
      visKey: 1,
    };
  },

  methods: {
    async searchOptions(val){
      const response = await this.$axios
        .get(
          `${this.BASE_URL}api/ingtx/sites/find/siteName/tx?term=${val}`
        )
      let dataProcessed = []
      response.data.map((element) => dataProcessed.push(element["siteName"]))
      this.options = dataProcessed;
      this.original = dataProcessed;
    },

    filterFn (val, update, abort) {
      if (val.length < 3) {
        abort()
        return
      }
      update(() => {
        this.searchOptions(val)
      })
    },
    changeVisData(value) {
      if(value>3){
      this.site = value;
      }
    },
    reset(){
      this.site = null;
      this.visKey++;
    }
  },
  computed :{
    ...mapState('links',['BASE_URL'])
  }
};
</script>
