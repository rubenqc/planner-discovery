<template>
  <div>
    <div class="flex q-mb-md">
      <select @change="setYear" class="q-mr-md">
        <option v-for="(year,index) in years" :key="index * 1000" :value="year" :selected="IsActualYear(year)">
          {{ year }}
        </option>
      </select>

      <select @change="setMonth">
        <option v-for="(month,index) in months" :key="index" :value="index" :selected="IsActualMonth(index)">
          {{ month }}
        </option>
      </select>
    </div>
    <canvas :id="idObj" class="w-h-chart"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";
import moment from "moment";

export default {
  props: {
    instanceName: {
      required: true,
      type: String,
    },
    idObj: {
      required: true,
      type: String,
    },
    history: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      years: [],
      year: moment().year(),
      month: moment().month(),
      myChart: null,
      config: {
        type: "line",
        data: {
          labels: [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27,
            28,
            29,
            30,
            31,
          ],
          datasets: [
            {
              label: `Throutput`,
              data: null,
              borderWidth: 2,
              borderColor: "#221E78",
              yAxisID: 'throutput'
            },
            {
              label: `Capacidad`,
              data: null,
              borderWidth: 2,
              borderColor: "#ff0000",
              yAxisID: 'capacidad'
            },
          ],
        },
        options: {
          legend: {
            labels: {
              fontSize: 14,
            },
          },
          responsive: false,
          maintainAspectRatio: true,
          scales: {
            yAxes: [{
              type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
              display: true,
              position: 'left',
              id: 'capacidad',
              scaleLabel : {
                labelString : "Capacidad",
                display : true
              },
            }, {
              type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
              display: true,
              position: 'right',
              id: 'throutput',
              scaleLabel : {
                labelString : "Throutput",
                display : true
              },

              // grid line settings
              gridLines: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
              },
            }],
          }
        },
      },
    };
  },
  created() {
    this.years = this.loadYears()
  },
  updated() {
    this.myChart.update(this.config);
  },
  mounted() {
    this.chartInit();
  },
  methods: {
    chartInit() {
      const ctx = document.getElementById(this.idObj);
      this.config.data.datasets[0].data = this.historyFiltered.throutput;
      this.config.data.datasets[1].data = this.historyFiltered.capacity;
      this.myChart = new Chart(ctx, this.config);
    },
    setYear(e) {
      this.year = e.target.value;
      this.config.data.datasets[0].data = this.historyFiltered.throutput;
      this.config.data.datasets[1].data = this.historyFiltered.capacity;
      this.myChart.update(this.config);
    },
    setMonth(e) {
      this.month = e.target.value;
      this.config.data.datasets[0].data = this.historyFiltered.throutput;
      this.config.data.datasets[1].data = this.historyFiltered.capacity;
      this.myChart.update(this.config);
    },
    loadYears() {
      let years = [];
      for (let i = 0; i <= 10; i++) {
        years.push(moment().subtract(i, 'years').year())
      }
      return years
    },
    IsActualMonth(indexOfMonth) {
      return indexOfMonth == moment().month()
    },
    IsActualYear(year) {
      return year == moment().year()
    }
  },
  computed: {
    historyFiltered() {
      const arrayFilter = this.history.filter(
        (log) => {
          console.log(moment(log.date).year(), "--", this.year)
          return moment(log.date).month() == this.month && moment(log.date).year() == this.year
        }
      );
      const arrayThroutput = arrayFilter.map((log) => log.throutput);
      const arrayCapacity = arrayFilter.map((log) => log.capacity);
      return {
        throutput : arrayThroutput,
        capacity : arrayCapacity
      };
    },
  },
};
</script>

<style>
.w-h-chart {
  height: 320px;
  width: 800px;
}
</style>
