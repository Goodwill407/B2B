import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class GraphService {

  barGraphApex() {
    const barChartOptions = {
      series: [
        {
          name: 'School',
          data: [],
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top', // top, center, bottom
          },
          columnWidth: '40%',
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: any) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: '10px',
          colors: ['#9aa0ac'],
        },
      },
      grid: {
        show: true, // This hides the grid lines
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      xaxis: {
        categories: [],
        position: 'bottom',
        labels: {
          offsetY: 0,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
          offsetY: -35,
        },
      },
      fill: {
        type: 'gradient',
        colors: ['#4F86F8', '#4F86F8'],
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val: any) {
            return val;
          },
        },
        lines: {
          show: false, // Ensure this is set to false
        },
      },
    };
    
    return barChartOptions;
    
  }

  horizontalBar() {
    const graphData = {
      series: [
        {
          data: []
        }
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          barHeight: "100%",
          distributed: true,
          horizontal: true,
          dataLabels: {
            position: "bottom",
          }
        }
      },
      colors: [
        "#33b2df",
        "#546E7A",
        "#d4526e",
        "#13d8aa",
        "#A5978B",
        "#2b908f",
        "#f9a3a4",
        "#90ee7e",
        "#f48024",
        "#69d2e7"
      ],
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          colors: ["#000"],
          fontSize: '11px'
        },
        formatter: function (val: any, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
        },
        offsetX: 0,
        dropShadow: {
          enabled: false
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        categories: []
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      title: {
        text: "Custom DataLabels",
        align: "center",
        floating: true
      },
      subtitle: {
        text: "Category Names as DataLabels inside bars",
        align: "center"
      },
      tooltip: {
        theme: "dark",
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: function (val: any, opt: any) {
              return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
            }
          }
        }
      }
    }
    return graphData;
  }
  barGraphCol_3() {
    const graphData = {
      series: [
        {
          name: "",
          data: []
        },
        {
          name: "",
          data: []
        },
        {
          name: "",
          data: []
        },
        {
          name: "",
          data: []
        },

      ],
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        stackType: "100%",
        toolbar: {
          show: false
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      xaxis: {
        categories: []
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: "right",
        offsetX: 0,
        offsetY: 50

      }
    }
    return graphData;
  }

  // Pai and donut graph

  PieGraph(chartType: any, totalType?: any, sumType?: any) {
    // let colors = [];
    // for (let i = 0; i < 5; i++) {
    //     colors.push(this.getRandomColor(i))
    // }
    const graphData = {
      series: [],
      chart: {
        type: chartType,
        height: '350px'
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        // colors: colors
      },
      tooltip: {
        y: {
          title: {
            formatter: (val: any) => {
              return val + ' ' + totalType + ':'
            }
          }
        }
      },
      // colors: colors,
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              // name: {
              //     formatter: (val:any) => {
              //         return val + ' ' + totalType
              //     }
              // },
              total: {
                show: true,

                formatter: (w: any) => {
                  const sum = w.globals.seriesTotals.reduce((a: any, b: any) => {
                    a = (a % 1 != 0) ? Number(a.toFixed(2)) : a;
                    b = (b % 1 != 0) ? Number(b.toFixed(2)) : b;
                    return a + b;
                  }, 0);
                  if (sumType == 'percentage') {
                    return sum + '%';
                  } else {
                    return sum;
                  }
                }

              },

            }
          },
        }
      },
      labels: [],
      legend: {
        position: 'bottom',
        formatter: function (val: any, opts: any) {
          opts.w.globals.series[opts.seriesIndex] = (opts.w.globals.series[opts.seriesIndex] % 1 != 0) ? Number(opts.w.globals.series[opts.seriesIndex].toFixed(2)) : opts.w.globals.series[opts.seriesIndex];

          return val + " - " + opts.w.globals.series[opts.seriesIndex];
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom"
            }
          }
        }
      ],
    }
    return graphData;
  }

  
 

  // for line chart 
  getLineChartData() {
    return {
      series: [
        {
          name: "Shirt",
          data: [0.5, 0.7, 1.0, 0.5, 2.5, 3.0, 4.5, 0.5, 3.5, 2.0, 1.5, 3.0, 4.0, 2.0, 3.5, 1.0, 2.5, 3.5, 4.0, 2.5, 3.0, 2.0, 4.5, 3.0, 4.0, 5.5, 6.0, 2.5, 4.0, 3.5, 3.0]
        },
        {
          name: "Jeans",
          data: [1.0, 2.5, 3.5, 2.0, 4.5, 3.0, 4.0, 5.5, 6.0, 2.5, 4.0, 3.5, 3.0, 5.0, 6.5, 7.0, 4.5, 6.0, 7.5, 3.0, 5.5, 4.5, 6.5, 7.5, 9.0, 5.0, 7.5, 8.5, 4.0, 6.5, 8.0]
        }        
      ],
      chart: {
        height: 360,
        type: 'line',
        zoom: {
          enabled: false // Disable zooming
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 2 // Adjust the line width
      },
      title: {
        text: 'Day-wise Total orders:',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0
        },
      },
      xaxis: {
        categories: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
        title: {
          text: 'Day'
        }
      },
      yaxis: {
        title: {
          text: 'Orders'
        }
      },
      colors: ['#800080', '#ADFF2F'], // Colors for the lines
      markers: {
        size: 0,
        colors: ['#black', 'black'], // Colors for the markers
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'left'
      }
    };
  }

}