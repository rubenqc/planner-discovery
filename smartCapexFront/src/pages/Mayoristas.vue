<template>
  <q-page class="flex column justify-start items-center">
    <h1 class="h1">Lista de Enlaces Mayoristas</h1>
    <LinkTableMayorista />
  </q-page>
</template>

<script>
import LinkTableMayorista from 'components/LinkTableMayorista'
export default {
  components :{
    LinkTableMayorista
  },
  name : 'PageIndexMayorista'
}
</script>

