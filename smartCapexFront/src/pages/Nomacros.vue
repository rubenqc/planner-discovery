<template>
  <q-page class="flex column justify-start items-center">
    <h1 class="h1">Lista de Enlaces No Macros</h1>
    <LinkTableNoMacros />
  </q-page>
</template>

<script>
import LinkTableNoMacros from 'components/LinkTableNoMacros'
export default {
  components :{
    LinkTableNoMacros
  },
  name : 'PageIndexNoMacros'
}
</script>

