<template>
  <q-dialog v-model="layout" persistent full-width>
    <q-layout view="Lhh lpR fff" container class="bg-white">
      <q-header class="bg-primary">
        <q-toolbar>
          <q-toolbar-title>Formulario para Registrar Enlace</q-toolbar-title>
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
                  <q-input v-model="form.validationDate" type="date" hint="Fecha de Validación" />
                  <q-input v-model="form.project" label="Proyecto" />
                  <q-input v-model="form.link" label="Enlace" />
                  <q-input v-model="form.instanceName" label="Instancia" />
                  <q-select v-model="form.gestor" :options="['U2000-TX', 'U2000-Datacom']" label="Gestor" />
                  <q-input v-model="form.modulation" label="Modulación" />
                  <q-input v-model="form.bandWidth" label="Ancho de Banda" />
                  <q-input
                    v-model="form.distance"
                    label="Distancia"
                    type="number"
                    :rules="[val => val > 0 || 'Debe ser mayor a 0']"
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
                  @click="form.media != 'FO' ? (step = 4) : (step = 7)"
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

                    <q-input v-model="form.technology" label="Tecnología" />
                    <q-input v-model="form.stationA" label="Ganancia Estación A" />
                    <q-input v-model="form.freqTX" label="Frecuencia TX" />
                    <q-input v-model="form.stageVisualization" label="Escenario" />
                    <template v-if="form.stageVisualization && form.stageVisualization.toUpperCase() ==='MAYORISTA' ">
                      <q-input v-model="form.address38" label="Dirección clientes 38 Ghz" />
                    </template>

                  </div>d
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
                  @click="form.media != 'FO' ? (step = 4) : (step = 3)"
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
    layout: Boolean,
    default: false,
  },
  methods: {
    //Metodo que valida si un numero es entero
    isInt(value) {
      const x = parseFloat(value);
      return !isNaN(value) && (x | 0) === x;
    },
    onClose() {
      this.$emit("onClose");
    },

    //Limitar Input Date
    limitDate(date) {
      return date >= "2019/01/01" && date <= "2020/12/31";
    },

    //Agregar canal a un arreglo desde this.channelExample
    addChannel(to) {
      if (to == "source") {
        this.form.microWave.source.channels.push(this.channelExample);
        this.channelExample = {
          bandFrequency: null,
          modulation: null,
          bandWidth: null,
          configuration: null,
          capacity: null,
        };
      } else if (to == "sink") {
        this.form.microWave.sink.channels.push(this.channelExample);
        this.channelExample = {
          bandFrequency: null,
          modulation: null,
          bandWidth: null,
          configuration: null,
          capacity: null,
        };
      }
    },

    //Eliminar canal de un arreglo por su indice y [source/sink]
    removeChannel(index, to) {
      if (to == "source") {
        this.form.microWave.source.channels.splice(index, 1);
      } else if (to == "sink") {
        this.form.microWave.sink.channels.splice(index, 1);
      }
    },

    //Enviar datos al servidor
    async sendLinkToServer() {
      this.sent = true;
      let link = JSON.parse(JSON.stringify(this.form));
      if (link.media == "FO") delete link.microWave;
      const response = await this.$axios.post(`${this.LINKS_URL}/createLink`, {
        enlace: link,
      });
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
        "MW PTP-BNL",
        "MW PTP-BNL"
      ],
      form: {
        validationDate: null,
        distributionType: "Urbano",
        microWave: {
          sink: {
            channels: [],
            capacity: null,
            modulation: null,
            bandWidth: null,
            bandFrequency: null,
          },
          source: {
            channels: [],
            capacity: null,
            modulation: null,
            bandWidth: null,
            bandFrequency: null,
          },
          configurationMain: null,
          diversity: false,
        },
        action: null,
        project: null,
        mediaType: "BH",
        gestor: "U2000-TX",
        item: null,
        link: null,
        media: "BH",
        departmentCode: null,
        nearEnd: {
          location: {
            coordinates: [],
          },
          code: null,
          name: null,
          antennaBrand: null,   //added 24/03/21
          antennaModel: null,   //added 24/03/21
          diameter: null,   //added 24/03/21
          radiant: null,   //added 24/03/21
        },
        farEnd: {
          location: {
            coordinates: [],
          },
          code: null,
          name: null,
          antennaBrand: null,   //added 24/03/21
          antennaModel: null,   //added 24/03/21
          diameter: null,   //added 24/03/21
          radiant: null,   //added 24/03/21
        },
        distance: null,
        instanceName: null,
        capacity: null,
        bandFrequency: null,    //added 18/05/2021
        modulation: null,   //added 18/05/2021
        bandWidth: null,    //added 18/05/2021
        utilization: null,
        technology: null,     //added 24/03/21
        stationA: null,     //added 24/03/21
        stationB: null,     //added 24/03/21
        typePlot: null,     //added 24/03/21
        freqTX: null,     //added 24/03/21
        freqRX: null,     //added 24/03/21
        address38: null,      //added 24/03/21
        requestNumber: null,      //added 24/03/21
        services38: null,     //added 24/03/21
        typeVisualization: null,     //added 24/03/21
        stageVisualization: null,     //added 24/03/21
      },
      channelExample: {
        bandFrequency: null,
        modulation: null,
        bandWidth: null,
        configuration: null,
        capacity: null,
      },
      columsChannel: [
        { name: "bandFrequency", label: "Frecuencia", field: "bandFrequency" },
        { name: "modulation", label: "Modulación", field: "modulation" },
        { name: "bandWidth", label: "Ancho de Banda", field: "bandWidth" },
        { name: "capacity", label: "Capacidad", field: "capacity" },
        {
          name: "configuration",
          label: "Configuración",
          field: "configuration",
        },
      ],
      sent: false,
    };
  },
  computed: {
    //Validaciones para Stepper
    stepSixValid() {
      if (this.form.microWave.sink.channels.length > 0) return false;
      else return true;
    },
    stepFiveValid() {
      if (this.form.microWave.source.channels.length > 0) return false;
      else return true;
    },
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

<style></style>
