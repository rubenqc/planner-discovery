<template>
  <div>
    <div class="flex q-mb-md">
      <select @change="setYear" >
        <option v-for="(year,index) in years" :key="index" :value="year" :selected="IsActualYear(year)">
          {{ year }}
        </option>
      </select>
    </div>
    <canvas :id="`${idObj}2`" class="w-h-chart"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";
import moment from "moment";
import { mapState } from 'vuex'

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
  },
  data() {
    return {
      years: [],
      year: moment().year(),
      myChart: null,
      config: {
        type: "line",
        data: {
          labels: [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre"
          ],
          datasets: [
            {
              type : 'bar',
              label: `Utilización ${this.instanceName}`,
              data: null,
              borderWidth: 2,
              borderColor: "#221E78",
            },
            {
              type : 'line',
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
            yAxes: [
              {
                ticks :{
                  beginAtZero: true,
                  steps: 10,
                  stepValue: 5,
                  max: 100
                },
                position: 'right',
                scaleLabel : {
                  labelString : "Utilización (%)",
                  display : true
                },
              },
              {
                position: 'left',
                scaleLabel : {
                  labelString : "Capacidad",
                  display : true
                },
                id: 'capacidad',
              },
            ],
          },
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
    async chartInit() {
      const ctx = document.getElementById(`${this.idObj}2`);
      const { data } = await this.$axios(`${this.LINKS_URL}/getMaxUtilizationByYear/${this.idObj}/${this.year}`)
      console.log(data)
      this.config.data.datasets[0].data = data.utilization;
      this.config.data.datasets[1].data = data.capacity;
      this.myChart = new Chart(ctx, this.config);
    },
    async setYear(e) {
      this.year = e.target.value;
      const { data } = await this.$axios(`${this.LINKS_URL}/getMaxUtilizationByYear/${this.idObj}/${this.year}`)
      console.log(data)
      this.config.data.datasets[0].data = data.utilization;
      this.config.data.datasets[1].data = data.capacity;
      this.myChart.update(this.config);
    },
    loadYears() {
      let years = [];
      for (let i = 0; i <= 10; i++) {
        years.push(moment().subtract(i, 'years').year())
      }
      return years
    },
    IsActualYear(year) {
      return year == moment().year()
    }
  },
  computed : {
    ...mapState('links',['LINKS_URL'])
  }
};
</script>

<style>
.w-h-chart {
  height: 320px;
  width: 800px;
}
</style>
