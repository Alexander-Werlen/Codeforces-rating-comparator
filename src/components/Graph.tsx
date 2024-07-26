
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface Props {
  ratingHistory: Record<string, string | number>[]
  users: string[]
  minRating: number
  maxRating: number
}

export const Graph: React.FC<Props> = ({ratingHistory, users, minRating, maxRating}) => {
  
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    }
  } satisfies ChartConfig

  for(let i = 0; i<users.length; i++){
    chartConfig[users[i] as keyof typeof chartConfig] = {
      label: users[i],
      color: `hsl(var(--chart-${(i%5)+1}))`
    }
  }
  const minVerticalValue = Math.max(Math.min(800, minRating-100),0)
  const maxVerticalValue = Math.min(4200 ,Math.max(1500, maxRating+300+(maxRating%100==0 ? + 35 : 0)))

  const fullFillValues = ["#AA0000", "#FF3333", "#FF7777", "#FFBB55", "#FFCC88", "#FF88FF", "#AAAAFF", "#77DDBB", "#77FF77", "#CCCCCC"]
  const fullVerticalValues = [1200,1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000]
  const verticalTickValues: number[] = fullVerticalValues.filter((v) => v<maxVerticalValue)
  const horizontalFillValues: string[] = fullFillValues.slice(-verticalTickValues.length-1)

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 pb-2 pl-1 pr-3">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] lg:h-[400px] w-full">
          <LineChart
            accessibilityLayer
            data={ratingHistory}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }}
          >
            <CartesianGrid vertical={true} syncWithTicks={true} horizontalFill={horizontalFillValues}/>
            <XAxis
              dataKey="date"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })
              }}
            />
            <YAxis 
              ticks={verticalTickValues}
              interval={0}
              domain={[minVerticalValue, maxVerticalValue]}
              width={35}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {users.map((handle) => 
              <Line
                key={handle}
                dataKey={handle}
                type="linear"
                stroke={`var(--color-${handle})`}
                strokeWidth={3}
                dot={false}
              />)
            }
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
