<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title><q-img src="../assets/planner2.jpeg" style="max-width : 8rem" class="q-mr-lg" /> SMART CAPEX</q-toolbar-title>

        <div>v1.0</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-1">
      <q-scroll-area
        style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
      >
        <q-list padding>
          <q-item clickable v-ripple to="/" exact>
            <q-item-section avatar>
              <q-icon name="sync_alt" />
            </q-item-section>

            <q-item-section>Enlaces de Red</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/mayorista" exact>
            <q-item-section avatar>
              <q-icon name="business" />
            </q-item-section>

            <q-item-section>Enlaces Mayoristas</q-item-section>
          </q-item>
<!--          <q-item clickable v-ripple to='/dependencies' exact>-->
<!--            <q-item-section avatar>-->
<!--              <q-icon name="star" />-->
<!--            </q-item-section>-->

<!--            <q-item-section>Dependecias</q-item-section>-->
<!--          </q-item>-->

          <q-item clickable v-ripple to='/links' exact>
            <q-item-section avatar>
              <q-icon name="settings_input_composite" />
            </q-item-section>

            <q-item-section>Link</q-item-section>
          </q-item>

          <q-item clickable v-ripple to='/routers' exact>
            <q-item-section avatar>
              <q-icon name="router" />
            </q-item-section>

            <q-item-section>Routers</q-item-section>
         </q-item>
          <q-item clickable v-ripple to='/sites' exact>
           <q-item-section avatar>
             <q-icon name="settings_input_antenna" />
           </q-item-section>

           <q-item-section>Sites</q-item-section>
         </q-item>
        </q-list>
      </q-scroll-area>

      <q-img
        class="absolute-top"
        src="../assets/planner1.jpeg"
        style="height: 150px"
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {
      leftDrawerOpen: false,
    };
  },
  methods : {
    toPage(page){
      this.$router.push(page).catch(err => {})
    }
  }
};
</script>
<style>
    .h1 {
    font-size: 2rem;
    display: inline-block;
    text-align: center;
    margin: 0;
  }
</style>
