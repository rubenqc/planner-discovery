<template>
  <q-page class="flex column justify-start items-center">
    <h1 class="h1">Lista de Enlaces Macros</h1>
    <LinkTableMacros />
  </q-page>
</template>

<script>
import LinkTableMacros from 'components/LinkTableMacros'
export default {
  components :{
    LinkTableMacros
  },
  name : 'PageIndexMacros'
}
</script>

