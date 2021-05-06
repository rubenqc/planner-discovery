<template>
  <q-splitter v-model="splitterModel" style="min-height: 300px;" :limits="[10, 10]" >
    <template v-slot:before>
      <q-tabs v-model="tab" vertical class="text-primary">
        <q-tab name="general" icon="dns" label="General" />
        <q-tab name="link" icon="trip_origin" label="Link" />
        <q-tab
          name="microwave"
          icon="tune"
          label="Microondas"
          v-if="link.media !== 'FO' && link.microWave"
        />
        <q-tab v-if="link.utilizationHistory.length > 0" name="history" icon="history" label="Historial" />
      </q-tabs>
    </template>

    <template v-slot:after>
      <q-tab-panels
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="jump-up"
        transition-next="jump-up"
      >
        <q-tab-panel name="general" style="max-height : 100%;max-width : 100%; overflow-y : auto">
          <div class="text-h4 q-mb-md">General</div>
          <div class="flex">
            <q-markup-table class="q-mr-lg">
              <tbody class="tblInfo">
                <tr v-if="link.distributionType">
                  <td class="text-left">Tipo de Alcance</td>
                  <td class="text-right">{{link.distributionType}}</td>
                </tr>
                <tr v-if="link.status">
                  <td class="text-left">Estado</td>
                  <td class="text-right">{{link.status}}</td>
                </tr>
                <tr v-if="link.media">
                  <td class="text-left">Media</td>
                  <td class="text-right">{{link.media}}</td>
                </tr>
                <tr v-if="link.departmentCode">
                  <td class="text-left">Codigo de Departamento</td>
                  <td class="text-right">{{link.departmentCode}}</td>
                </tr>
              </tbody>
            </q-markup-table>
            <q-markup-table class="q-mr-lg">
              <tbody class="tblInfo">
                <tr v-if="link.validationDate">
                  <td class="text-left">Fecha de Validación</td>
                  <td class="text-right">{{link.validationDate}}</td>
                </tr>
                <tr v-if="link.action">
                  <td class="text-left">Acción</td>
                  <td class="text-right">{{link.action}}</td>
                </tr>
                <tr v-if="link.item">
                  <td class="text-left">Item</td>
                  <td class="text-right">{{link.item}}</td>
                </tr>
                <tr v-if="link.link">
                  <td class="text-left">Enlace</td>
                  <td class="text-right">{{link.link}}</td>
                </tr>
              </tbody>
              <tbody class="tblInfo">
              <tr v-if="link.forecastDate">
                <td class="text-left">Fecha de ForeCast</td>
                <td class="text-right">{{link.forecastDate}}</td>
              </tr>
              <tr v-if="link.updatedDate">
                <td class="text-left">Fecha de Actualización</td>
                <td class="text-right">{{link.updatedDate}}</td>
              </tr>
              </tbody>
            </q-markup-table>
            <q-markup-table class="q-mr-lg">
              <tbody class="tblInfo">
                <tr v-if="link.technology">
                  <td class="text-left">Tecnolgía</td>
                  <td class="text-right">{{link.technology}}</td>
                </tr>
                <tr v-if="link.stationA">
                  <td class="text-left">Ganancia de estación A</td>
                  <td class="text-right">{{link.stationA}}</td>
                </tr>
                <tr v-if="link.stationB">
                  <td class="text-left">Ganancia de estación B</td>
                  <td class="text-right">{{link.stationB}}</td>
                </tr>
                <tr v-if="link.typePlot">
                  <td class="text-left">Tipo de trama</td>
                  <td class="text-right">{{link.typePlot}}</td>
                </tr>
              </tbody>
            </q-markup-table>
            <q-markup-table class="q-mr-lg">
              <tbody class="tblInfo">
              <tr v-if="link.freqTX">
                <td class="text-left">Frecuencia TX</td>
                <td class="text-right">{{link.freqTX}}</td>
              </tr>
              <tr v-if="link.freqRX">
                <td class="text-left">Frecuencia RX</td>
                <td class="text-right">{{link.freqRX}}</td>
              </tr>
              <tr v-if="link.typeVisualization">
                <td class="text-left">Tipo de Visualización</td>
                <td class="text-right">{{link.typeVisualization}}</td>
              </tr>
              <tr v-if="link.stageVisualization">
                <td class="text-left">Estación de Visualización</td>
                <td class="text-right">{{link.stageVisualization}}</td>
              </tr>
              </tbody>
            </q-markup-table>
            <template v-if="link.stageVisualization === 'Mayorista' ">
              <q-markup-table class="q-mr-lg">
                <tbody class="tblInfo">
                <tr v-if="link.requestNumber">
                  <td class="text-left">Numero de solicitud</td>
                  <td class="text-right">{{link.requestNumber}}</td>
                </tr>
                <tr v-if="link.services38">
                  <td class="text-left">Servicios Mayoristas 38Ghz</td>
                  <td class="text-right">{{link.services38}}</td>
                </tr>
                <tr v-if="link.address38">
                  <td class="text-left">Dirección Clientes 38 Ghz</td>
                  <td class="text-right">{{link.address38}}</td>
                </tr>
                </tbody>
              </q-markup-table>
            </template>
          </div>
        </q-tab-panel>

        <q-tab-panel name="link" style="max-height : 100%;max-width : 100%; overflow-y : auto">
          <div class="flex">
            <div class="q-mr-xl">
              <div class="text-h4 q-mb-md">Source</div>
              <div class="flex">
                <q-markup-table>
                  <tbody class="tblInfo">
                  <tr v-if="link.nearEnd.code">
                    <td class="text-left">Codigo</td>
                    <td class="text-right">{{link.nearEnd.code}}</td>
                  </tr>
                  <tr v-if="link.nearEnd.name">
                    <td class="text-left">Nombre</td>
                    <td class="text-right">{{link.nearEnd.name}}</td>
                  </tr>
                  <tr v-if="link.nearEnd.location.coordinates[0]">
                    <td class="text-left">Latitud</td>
                    <td class="text-right">{{link.nearEnd.location.coordinates[0]}}</td>
                  </tr>
                  <tr v-if="link.nearEnd.location.coordinates[1]">
                    <td class="text-left">Longitud</td>
                    <td class="text-right">{{link.nearEnd.location.coordinates[1]}}</td>
                  </tr>
                  </tbody>
                </q-markup-table>
                <q-markup-table>
                  <tbody class="tblInfo">
                  <tr v-if="link.nearEnd.antennaBrand">
                    <td class="text-left">Marca de Antena</td>
                    <td class="text-right">{{link.nearEnd.antennaBrand}}</td>
                  </tr>
                  <tr v-if="link.nearEnd.antennaModel">
                    <td class="text-left">Modelo de Antena</td>
                    <td class="text-right">{{link.nearEnd.antennaModel}}</td>
                  </tr>
                  <tr v-if="link.nearEnd.diameter">
                    <td class="text-left">Diametro de Antena</td>
                    <td class="text-right">{{link.nearEnd.diameter}}</td>
                  </tr>
                  <tr v-if="link.nearEnd.radiant">
                    <td class="text-left">Altura radiantes</td>
                    <td class="text-right">{{link.nearEnd.radiant}}</td>
                  </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
            <div>
              <div class="text-h4 q-mb-md">Sink</div>
              <div class="flex">
                <q-markup-table>
                  <tbody class="tblInfo">
                  <tr v-if="link.farEnd.code">
                    <td class="text-left">Codigo</td>
                    <td class="text-right">{{link.farEnd.code}}</td>
                  </tr>
                  <tr v-if="link.farEnd.name">
                    <td class="text-left">Nombre</td>
                    <td class="text-right">{{link.farEnd.name}}</td>
                  </tr>
                  <tr v-if="link.farEnd.location.coordinates[0]">
                    <td class="text-left">Latitud</td>
                    <td class="text-right">{{link.farEnd.location.coordinates[0]}}</td>
                  </tr>
                  <tr v-if="link.farEnd.location.coordinates[1]">
                    <td class="text-left">Longitud</td>
                    <td class="text-right">{{link.farEnd.location.coordinates[1]}}</td>
                  </tr>
                  </tbody>
                </q-markup-table>
                <q-markup-table>
                  <tbody class="tblInfo">
                  <tr v-if="link.farEnd.antennaBrand">
                    <td class="text-left">Marca de Antena</td>
                    <td class="text-right">{{link.farEnd.antennaBrand}}</td>
                  </tr>
                  <tr v-if="link.farEnd.antennaModel">
                    <td class="text-left">Modelo de Antena</td>
                    <td class="text-right">{{link.farEnd.antennaModel}}</td>
                  </tr>
                  <tr v-if="link.farEnd.diameter">
                    <td class="text-left">Diametro de Antena</td>
                    <td class="text-right">{{link.farEnd.diameter}}</td>
                  </tr>
                  <tr v-if="link.farEnd.radiant">
                    <td class="text-left">Altura radiantes</td>
                    <td class="text-right">{{link.farEnd.radiant}}</td>
                  </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel
          v-if="link.media !== 'FO' && link.microWave"
          name="microwave"
          style="max-height : 300px;max-width : 100%; overflow-y : auto"
        >
          <div class="text-h4 q-mb-md">Microondas</div>
          <q-tabs
            v-model="microWaveTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
            style="width : 50%"
          >
            <q-tab name="general" label="General" />
            <q-tab name="source" label="Source" />
            <q-tab name="sink" label="Sink" />
          </q-tabs>
          <div class="flex">
            <q-separator />

            <q-tab-panels v-model="microWaveTab" animated>
              <q-tab-panel name="general">
                <q-markup-table>
                  <tbody class="tblInfo">
                    <tr v-if="link.microWave.configurationMain">
                      <td class="text-left">Configuración Principal</td>
                      <td class="text-right">{{link.microWave.configurationMain}}</td>
                    </tr>
                    <tr v-if="link.microWave.diversity">
                      <td class="text-left">Diversidad</td>
                      <td class="text-right">{{link.microWave.diversity}}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-tab-panel>

              <q-tab-panel name="source">
                <div class="flex items-start">
                  <q-list bordered separator class="rounded-borders q-mr-xl">
                    <q-item v-if="link.microWave.source.bandFrequency">
                      <q-item-section class="bold">Frecuencia de Banda</q-item-section>
                      <q-item-section side>{{link.microWave.source.bandFrequency}}</q-item-section>
                    </q-item>
                    <q-item v-if="link.microWave.source.bandWidth">
                      <q-item-section class="bold">Ancho de Banda</q-item-section>
                      <q-item-section side>{{link.microWave.source.bandWidth}}</q-item-section>
                    </q-item>
                    <q-item v-if="link.microWave.source.capacity">
                      <q-item-section class="bold">Capacidad</q-item-section>
                      <q-item-section side>{{link.microWave.source.capacity}}</q-item-section>
                    </q-item>
                    <q-item v-if="link.microWave.source.modulation">
                      <q-item-section class="bold">Modulación</q-item-section>
                      <q-item-section side>{{link.microWave.source.modulation}}</q-item-section>
                    </q-item>
                  </q-list>

                  <q-list bordered separator class="rounded-borders">
                    <q-expansion-item expand-separator label="Canales" class="bold">
                      <q-expansion-item
                        group="channelsgroup"
                        v-for="(channel, index) in link.microWave.sink.channels"
                        :key="index"
                        :header-inset-level="1"
                        expand-separator
                        :label="`Canal ${index +1}`"
                        class="font-normal"
                      >
                        <q-card class="q-pl-xl">
                          <q-card-section class="flex justify-between">
                            <div>Frecuencia de Banda</div>
                            <div>{{channel.bandFrequency}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Ancho de Banda</div>
                            <div>{{channel.bandWidth}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Capacidad</div>
                            <div>{{channel.capacity}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Configuración</div>
                            <div>{{channel.configuration}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Modulación</div>
                            <div>{{channel.modulation}}</div>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </q-expansion-item>
                  </q-list>
                </div>
              </q-tab-panel>

              <q-tab-panel name="sink">
                <div class="flex items-start">
                  <q-list bordered separator class="rounded-borders q-mr-xl">
                    <q-item v-if="link.microWave.sink.bandFrequency">
                      <q-item-section class="bold">Frecuencia de Banda</q-item-section>
                      <q-item-section side>{{link.microWave.sink.bandFrequency}}</q-item-section>
                    </q-item>
                    <q-item v-if="link.microWave.sink.bandWidth">
                      <q-item-section class="bold">Ancho de Banda</q-item-section>
                      <q-item-section side>{{link.microWave.sink.bandWidth}}</q-item-section>
                    </q-item>
                    <q-item v-if="link.microWave.sink.capacity">
                      <q-item-section class="bold">Capacidad</q-item-section>
                      <q-item-section side>{{link.microWave.sink.capacity}}</q-item-section>
                    </q-item>
                    <q-item v-if="link.microWave.sink.modulation">
                      <q-item-section class="bold">Modulación</q-item-section>
                      <q-item-section side>{{link.microWave.sink.modulation}}</q-item-section>
                    </q-item>
                  </q-list>

                  <q-list bordered separator class="rounded-borders" style="min-width: 20rem;">
                    <q-expansion-item expand-separator label="Canales" class="bold">
                      <q-expansion-item
                        group="channelsgroup"
                        v-for="(channel, index) in link.microWave.sink.channels"
                        :key="index"
                        :header-inset-level="1"
                        expand-separator
                        :label="`Canal ${index +1}`"
                        class="font-normal"
                      >
                        <q-card class="q-pl-xl">
                          <q-card-section class="flex justify-between">
                            <div>Frecuencia de Banda</div>
                            <div>{{channel.bandFrequency}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Ancho de Banda</div>
                            <div>{{channel.bandWidth}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Capacidad</div>
                            <div>{{channel.capacity}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Configuración</div>
                            <div>{{channel.configuration}}</div>
                          </q-card-section>
                          <q-card-section class="flex justify-between">
                            <div>Modulación</div>
                            <div>{{channel.modulation}}</div>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </q-expansion-item>
                  </q-list>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </q-tab-panel>

        <q-tab-panel name="history" style="max-height : 450px;max-width : 100%; overflow: auto;" v-if="link.utilizationHistory.length > 0">
          <q-tabs
            v-model="logTabs"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
            style="width : 50%"
          >
            <q-tab name="ByMonth" label="Utilización" />
            <q-tab name="throutput" label="Throutput" />
          </q-tabs>
          <div class="flex">
            <q-separator />
            <q-tab-panels v-model="logTabs" animated>

              <q-tab-panel name="ByMonth">
                <label for="MonthChart" class="q-mr-md">
                  Por Mes
                  <input type="radio" name="typeChart" id="MonthChart" v-model="toggleChart" value="month">
                </label>
                <label for="YearChart">
                  Por Año
                  <input type="radio" name="typeChart" id="YearChart" v-model="toggleChart" value="year">
                </label>
                <UtilizationByMonthChart class="q-mt-md" v-if="toggleChart == 'month'" :instanceName="link.instanceName" :idObj="link._id" :history="link.utilizationHistory" />
                <MaxUtilizationByYearChart class="q-mt-md" v-else :instanceName="link.instanceName" :idObj="link._id" />
              </q-tab-panel>

              <q-tab-panel name="throutput">
                <label for="montTh" class="q-mr-md">
                  Por Mes
                  <input type="radio" name="typeChart" id="montTh" v-model="toggleTH" value="month">
                </label>
                <label for="yearTh">
                  Por Año
                  <input type="radio" name="typeChart" id="yearTh" v-model="toggleTH" value="year">
                </label>
                <ThrouputByYearAndMonthChart class="q-mt-md" v-if="toggleTH == 'month'" :instanceName="link.instanceName" :idObj="link._id" :history="link.utilizationHistory" />
                <MaxThroutputByYearChart class="q-mt-md" v-else :instanceName="link.instanceName" :idObj="link._id" />
              </q-tab-panel>

            </q-tab-panels>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-splitter>
</template>

<script>
import UtilizationByMonthChart from './UtilizationByYearAndMonthChart'
import MaxUtilizationByYearChart from './MaxUtilizationByYearChart'
import MaxThroutputByYearChart from './MaxThroutputByYearChart'
import ThrouputByYearAndMonthChart from './ThrouputByYearAndMonthChart'
export default {
  components : {
    UtilizationByMonthChart,
    MaxUtilizationByYearChart,
    ThrouputByYearAndMonthChart,
    MaxThroutputByYearChart
  },
  props: {
    link: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      tab: "general",
      microWaveTab: "general",
      logTabs : "ByMonth",
      splitterModel: 10,
      toggleChart : "year",
      toggleTH : "year"
    };
  },
};
</script>

<style>
.tblInfo tr td:first-child {
  font-weight: bold;
}
.bold {
  font-weight: bold;
}
.font-normal {
  font-weight: normal;
}
</style>
