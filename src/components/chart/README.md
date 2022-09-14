# CChart

The webapp using this package should install `echarts`, `vue-echarts` as dependencies  and `@vue/composition-api` as dev dependencies
Then make sure to import the relevant Echart components and chart types, take this as an example:
```
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'

import {
  SVGRenderer,
} from 'echarts/renderers'

import {
  LineChart,
  BarChart,
} from 'echarts/charts'

import {
  TitleComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'

use([
  SVGRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
])

Vue.component('e-charts', ECharts)
```
