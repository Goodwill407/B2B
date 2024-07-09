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

  radialBar() {
    const graphData = {
      series: [],
      chart: {
        height: 325,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      colors: ['#FF4560', '#775DD0', '#00E396', '#FEB019'],
      labels: [],
      legend: {
        show: true,
        floating: true,
        fontSize: '13px',
        position: 'left',
        offsetX: 10,
        offsetY: 10,
        labels: {
          useSeriesColors: true,
        },
        itemMargin: {
          horizontal: 3,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              show: false,
            },
          },
        },
      ],
    };
    return graphData
  }
  radarGraph() {
    const graphData = {
      series: [
        {
          name: "Series 1",
          data: [80, 50, 30, 40, 100, 20]
        }
      ],
      chart: {
        height: 350,
        type: "radar",
        toolbar: {
          show: false
        }
      },
      title: {
        text: ""
      },
      xaxis: {
        categories: ["January", "February", "March", "April", "May", "June"]
      },
      options : {
        markers: {
          size: 5,
          hover: {
            size: 10
          }
        }
      }

    };
    return graphData
  }

}