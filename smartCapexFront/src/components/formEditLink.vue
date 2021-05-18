<template>
  <q-dialog v-model="layout" persistent full-width v-if="form">
    <q-layout view="Lhh lpR fff" container class="bg-white">
      <q-header class="bg-primary">
        <q-toolbar>
          <q-toolbar-title>Formulario para Editar Enlace</q-toolbar-title>
          <q-btn flat v-close-popup round dense icon="close" @click="onClose" />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page padding>
          <q-stepper v-model="step" vertical color="primary" animated>
            <q-step
              :name="1"
              title="Información Basica del Enlace"
              icon="settings"
              :done="step > 1"
            >
              <div class="flex justify-between" style="width : 100%">
                <div style="width : 45%">
                  <q-input v-model="form.validationDate" type="date" hint="Fecha de Validación"/>
                  <q-input v-model="form.project" label="Proyecto" />
                  <q-input v-model="form.link" label="Enlace" />
                  <q-input v-model="form.instanceName" label="Instancia" />
                  <q-select v-model="form.gestor" :options="['U2000-TX', 'U2000-Datacom']" label="Gestor" />
                  <q-input v-model="form.modulation" label="Modulación" />
                  <q-input v-model="form.bandWidth" label="Ancho de Banda" />
                  <q-input
                    v-model="form.distance"
                    label="Distancia (Solo en caso de ser MV)"
                    type="number"
                    :rules="[ '' ||'Debe ser mayor a 0']"
                  />
                </div>
                <div style="width : 45%">
                  <q-select v-model="form.media" :options="['BH', 'LH', 'FO','RENTADO-FO']" label="Medio" />
                  <q-input v-model="form.action" label="Acción" />

                  <q-select
                    v-model="form.distributionType"
                    :options="['Rural', 'Urbano']"
                    label="Tipo"
                  />
                  <q-input v-model="form.forecastDate" type="date" hint="Fecha de Forecast" class="ok"/>
                  <q-input v-model="form.departmentCode" label="Codigo Dpto." />
                  <q-input v-model="form.capacity" label="Capacidad" type="Number" />
                  <q-select v-model="form.mediaType" :options="optionsMediaType" label="Medio Ing" />
                  <q-input v-model="form.bandFrequency" label="Frecuencia de Banda" />
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn @click="step = 2" :disable="stepOneValid" color="primary" label="Continuar" />
              </q-stepper-navigation>
            </q-step>

            <q-step :name="2" title="Información del NE" icon="settings" :done="step > 2">
              <div class="flex justify-between" style="width : 100%">
                <div style="width : 45%">
                  <q-input v-model="form.nearEnd.code" label="Codigo" />
                  <q-input v-model="form.nearEnd.name" label="Nombre" />
                  <template v-if="form.media === 'BH' || form.media === 'LH'" >
                    <q-input v-model="form.nearEnd.antennaBrand" label="Marca de antena" />
                    <q-input v-model="form.nearEnd.diameter" label="Diametro" />
                  </template>
                </div>
                <div style="width : 45%">
                  <q-input
                    v-model="form.nearEnd.location.coordinates[0]"
                    label="Latitud"
                    type="number"
                  />
                  <q-input
                    v-model="form.nearEnd.location.coordinates[1]"
                    label="Longitud"
                    type="number"
                  />
                  <template v-if="form.media === 'BH' || form.media === 'LH'" >
                    <q-input v-model="form.nearEnd.antennaModel" label="Modelo de antena" />
                    <q-input v-model="form.nearEnd.radiant" label="Altura de radiantes" />
                  </template>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn @click="step = 3" :disable="stepTwoValid" color="primary" label="Continuar" />
                <q-btn flat @click="step = 1" color="primary" label="Regresar" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <q-step :name="3" title="Información del FE" icon="settings" :done="step > 3">
              <div class="flex justify-between" style="width : 100%">
                <div style="width : 45%">
                  <q-input v-model="form.farEnd.code" label="Codigo" />
                  <q-input v-model="form.farEnd.name" label="Nombre" />
                  <template v-if="form.media === 'BH' || form.media === 'LH'" >
                    <q-input v-model="form.farEnd.antennaBrand" label="Marca de antena" />
                    <q-input v-model="form.farEnd.diameter" label="Diametro" />
                  </template>
                </div>
                <div style="width : 45%">
                  <q-input
                    v-model="form.farEnd.location.coordinates[0]"
                    label="latitud"
                    type="number"
                  />
                  <q-input
                    v-model="form.farEnd.location.coordinates[1]"
                    label="longitud"
                    type="number"
                  />
                  <template v-if="form.media === 'BH' || form.media === 'LH'" >
                    <q-input v-model="form.farEnd.antennaModel" label="Modelo de antena" />
                    <q-input v-model="form.farEnd.radiant" label="Altura de radiantes" />
                  </template>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn
                  @click="validateStepFO"
                  :disable="stepTreeValid"
                  color="primary"
                  label="Continuar"
                />
                <q-btn flat @click="step = 2" color="primary" label="Regresar" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
            <template v-if="form.media === 'BH' || form.media === 'LH'">
              <q-step
                :name="4"
                title="Configuración de Microondas"
                caption="solo en media de tipo BH/LH"
                icon="settings"
                :done="step > 4"
              >
                <div class="flex justify-between" style="width : 100%">
                  <div style="width : 45%">
                    <q-input v-model="form.configurationMain" label="Configuración" />

                    <q-input v-model="form.technology" label="Tecnologia" />
                    <q-input v-model="form.stationA" label="Ganacia Estación A" />
                    <q-input v-model="form.freqTX" label="Frecuencia TX" />
                    <q-input v-model="form.stageVisualization" label="Escenario" />
                    <template v-if="form.stageVisualization && form.stageVisualization.toUpperCase() ==='MAYORISTA' ">
                      <q-input v-model="form.address38" label="Dirección clientes 38 Ghz" />
                    </template>

                  </div>
                  <div style="width : 45%">
                    <q-checkbox left-label v-model="form.diversity" label="Diversidad" />

                    <q-input v-model="form.typePlot" label="Tipo trama" />
                    <q-input v-model="form.stationB" label="Ganancia Estación B" />
                    <q-input v-model="form.freqRX" label="Frecuencia RX" />
                    <q-input v-model="form.typeVisualization" label="Tipo" />
                    <template v-if="form.stageVisualization && form.stageVisualization.toUpperCase() ==='MAYORISTA' ">
                      <q-input v-model="form.services38" label="Servicios mayoristas 38Ghz" />
                      <q-input v-model="form.requestNumber" label="Número de Solicitud" />
                    </template>

                  </div>
                </div>
                <q-stepper-navigation>
                  <q-btn
                    @click="step = 7"
                    color="primary"
                    label="Continuar"
                    :disable="stepFourValid"
                  />
                  <q-btn flat @click="step = 3" color="primary" label="Regresar" class="q-ml-sm" />
                </q-stepper-navigation>
              </q-step>
            </template>
            <q-step :name="7" title="Grabar Información" icon="add_comment">
              Está seguro que desea grabar la información?
              <q-stepper-navigation>
                <q-btn
                  color="primary"
                  label="Guardar"
                  :disable="sent"
                  @click="sendLinkToServer"
                  :loading="sent"
                />
                <q-btn
                  flat
                  :disable="sent"
                  @click="step = 3"
                  color="primary"
                  label="Regresar"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

          </q-stepper>
          <q-ajax-bar ref="bar" position="top" color="primary" size="20px" skip-hijack />
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script>
import { mapState } from "vuex";
export default {

  props: {
    layout: {
      type: Boolean,
      default: false,
    },
    form: {
      required: true,
    },
  },
  methods: {
    //Metodo que valida si un numero es entero
    isInt(value) {
      const x = parseFloat(value);
      return !isNaN(value) && (x | 0) === x;
    },

    onClose() {
      this.step = 1;
      this.$emit("onClose");
    },

    //Limitar Input Date
    limitDate(date) {
      return date >= "2019/01/01" && date <= "2020/12/31";
    },

    //validate step FO
    validateStepFO(){
      if(this.form.media === 'FO' || this.form.media === 'RENTADO-FO'){
          this.step = 7
      }else{
        this.step = 4
      }
    } ,

    //Enviar datos al servidor
    async sendLinkToServer() {
      this.sent = true;
      let link = JSON.parse(JSON.stringify(this.form));
      const _id = link._id;
      delete link._id;
      delete link.__v;
      if (link.media == "FO" || link.media == "Rentado-FO"){
        delete link.configurationMain;
        delete link.diversity;
      }
      const response = await this.$axios.patch(
        `${this.LINKS_URL}/${_id}/updateLink`,
        {
          enlace: link,
        }
      );
      if (response.status == 200) {
        this.$emit("onSuccess");
      } else {
        this.$emit("onError");
      }
      this.sent = false;
      this.step = 1;
    },
  },
  data() {
    return {
      step: 1,
      sent: false,
      optionsMediaType:[
        "AGG-FO",
        "BH",
        "CSR-Rentado",
        "FO",
        "FO-rentado",
        "LH",
        "PAG-FO",
        "PAG-MW",
        "PAG-Rentado",
        "MW-BNL-PMP",
        "MW-BNL-PTP"
      ]
    };
  },
  computed: {
    //Validaciones para Stepper
    stepFourValid() {
      if (this.form.configurationMain) return false;
      else return true;
    },
    stepTreeValid() {
      if (
        this.form.farEnd.code &&
        this.form.farEnd.name &&
        this.form.farEnd.location.coordinates[0] != 0 &&
        this.form.farEnd.location.coordinates[1] != 0
      )
        return false;
      else return true;
    },
    stepTwoValid() {
      if (
        this.form.nearEnd.code &&
        this.form.nearEnd.name &&
        this.form.nearEnd.location.coordinates[0] &&
        this.form.nearEnd.location.coordinates[1]
      )
        return false;
      else return true;
    },
    stepOneValid() {
      if (
        this.form.link &&
        this.form.gestor &&
        this.form.departmentCode &&
        this.form.media
      )
        return false;
      else return true;
    },
    ...mapState("links", ["LINKS_URL"]),
  },
};
</script>

<style>
.ok,.q-field--float,.q-field--focused q-field__label{
  top : 0 !important
}
</style>
