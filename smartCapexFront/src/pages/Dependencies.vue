<template>
  <q-page class="flex flex-center">
    <div class="flex justify-between q-mt-xl items-start" style="width : 80%">
      <h1 class="h1" style="vertical-align: top;line-height: 1;">Diagramas de instancia</h1>
      <q-select
        filled
        v-model="site"
        clearable
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        label="Nombre del site"
        :options="options"
        @filter="filterFn"
        style="width: 300px"
        @input="changeVisData"
        v-if="original"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-skeleton v-else type="QInput" style="width: 300px" />
    </div>
    <div style="width : 90%; height :70vh" class="q-mb-xl">
      <HierarchyDiagram :site="site" />
    </div>
  </q-page>
</template>

<script>
import HierarchyDiagram from "components/DependenciesDiagram";
import { mapState } from 'vuex'
export default {
  components: {
    HierarchyDiagram,
  },
  created() {
    this.searchOptions()
  },
  name: "PageDiagrama",
  data() {
    return {
      model: null,
      options: null,
      original : null,
      site: null,
      // visKey: 1,
    };
  },

  methods: {
    async searchOptions(){
      const response = await this.$axios
        .get(
          `${this.LINKS_URL}/getInstancesByString/h`
        )
      this.options = response.data;
      this.original = response.data;
    },
    filterFn (val, update) {
      update(() => {
        const needle = val.toLowerCase()
        this.options = this.original.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    changeVisData(value) {
      this.site = value;
      this.visKey++;
    },
  },
  computed :{
    ...mapState('links',['LINKS_URL'])
  }
};
</script>
