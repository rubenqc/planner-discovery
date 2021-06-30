<template>
  <q-page class="flex column justify-start items-center">
    <h1 class="h1">Lista de Sites</h1>
    <SitesTable />
  </q-page>
</template>

<script>
import SitesTable from "components/SitesTable";
export default {
  components :{
    SitesTable
  },
  name : 'PageSites'
}
</script>
