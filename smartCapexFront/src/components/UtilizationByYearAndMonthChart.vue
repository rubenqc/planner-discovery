<template>
  <div>
    <div class="flex q-mb-md">
      <select @change="setYear" class="q-mr-md">
        <option v-for="(year,index) in years" :key="index * 1000" :value="year" :selected="IsActualYear(year)" >
          {{ year }}
        </option>
      </select>

      <select @change="setMonth">
        <option v-for="(month,index) in months" :key="index" :value="index" :selected="IsActualMonth(index)" >
          {{ month }}
        </option>
      </select>
    </div>
    <canvas :id="idObj" class="w-h-chart" :key="visData" ></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";
// import ChartDataLabels from 'chartjs-plugin-datalabels';

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
      colors : ["#221E78","#781e1e","#1e782d","#751e78",
                "#1e7875","#78641e","#6b781e","#78371e"],
      config: {
        // plugins: [ChartDataLabels],
        type: "line",
        data: {
          // plugins: {
          //   // Change options for ALL labels of THIS CHART
          //   datalabels: {
          //     color: '#36A2EB'
          //   }
          // },
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
            type : 'line',
            label: `Capacidad`,
            data: null,
            borderWidth: 2,
            borderColor: "#ff0000",
            yAxisID: 'capacidad'
          }
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
                ticks : {
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
      visData : 1
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
      this.config.data.datasets[0].data = this.historyFiltered.capacity
      this.historyFiltered.distincInstanceNames.forEach((instanceName, index) => {
        this.config.data.datasets.push(
          {
            label: `Utilización ${instanceName}`,
            type: 'bar',
            data: this.historyFiltered.logsByInstances[index],
            borderWidth: 2,
            backgroundColor :  this.colors[index],
            borderColor: this.colors[index],
          }
        )
      })
      this.myChart = new Chart(ctx, this.config);
    },
    setYear(e) {
      this.year = e.target.value;
      this.config.data.datasets = this.config.data.datasets.slice(0,1)
      this.myChart.reset()
      this.config.data.datasets[0].data = this.historyFiltered.capacity
      this.historyFiltered.distincInstanceNames.forEach((instanceName, index) => {
        this.config.data.datasets.push(
          {
            label: `Utilización ${instanceName}`,
            type: 'bar',
            data: this.historyFiltered.logsByInstances[index],
            borderWidth: 2,
            borderColor: this.colors[index],
            backgroundColor :  this.colors[index],
          }
        )
      })
      this.myChart.update(this.config);
    },
    setMonth(e) {
      this.month = e.target.value;
      this.config.data.datasets = this.config.data.datasets.slice(0,1)
      this.myChart.reset()
      this.config.data.datasets[0].data = this.historyFiltered.capacity
      this.historyFiltered.distincInstanceNames.forEach((instanceName, index) => {
        this.config.data.datasets.push(
          {
            label: `Utilización ${instanceName}`,
            type: 'bar',
            data: this.historyFiltered.logsByInstances[index],
            borderWidth: 2,
            borderColor: this.colors[index],
            backgroundColor :  this.colors[index],

          }
        )
      })
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
    },
    incrementVisData(){
      this.visData++
    }
  },
  computed: {
    historyFiltered() {
      const _historyFiltered = this.history.filter(log => moment(log.date).month() == this.month && moment(log.date).year() == this.year);
      let capacity = []
      let distincInstanceNames = [];

      if(_historyFiltered.length >0){
        const offsetCapacity = parseInt(_historyFiltered[0].date.split("-")[2]) -1
        for (let i = 0; i < offsetCapacity; i++){
          capacity.unshift(NaN)
        }
      }

      _historyFiltered.forEach(log => {
        capacity.push(log.capacity)
        if(!distincInstanceNames.includes(log.instanceName)){
          distincInstanceNames.push(log.instanceName)
        }
      })

      let logsByInstances = [];
      let offset = 0
      distincInstanceNames.forEach((instaceName,index) =>{
        let utilization = _historyFiltered.filter(log => log.instanceName == instaceName).map(log => log.maxUtilization)
        let date = _historyFiltered.filter(log => log.instanceName == instaceName).map(log => log.date)

        if(index == 0){
          const cls = parseInt(date[0].split("-")[2]) -1
          offset += cls
        }

        for (let i = 0; i < offset; i++){
          utilization.unshift(NaN)
        }

        offset += utilization.length
        logsByInstances.push(utilization)
      })
      return {
        distincInstanceNames,
        logsByInstances,
        capacity
      }
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
