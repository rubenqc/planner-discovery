<template>
  <q-page class="flex column justify-start items-center">
    <h1 class="h1">Lista de Enlaces de red</h1>
    <LinkTable />
  </q-page>
</template>

<script>
import LinkTable from 'components/LinkTable'
export default {
  components :{
    LinkTable
  },
  name : 'PageIndex'
}
</script>
