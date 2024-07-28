
import {
  Card
} from "@/components/ui/card"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type DayData = {
  dateUNIX: number,
  rating: number,
  handle: string
}
type UsersRatingHistory = {handle: string, rating_history: DayData[]}[]

interface Props {
  ratingsHistory: UsersRatingHistory
}


export const Graph: React.FC<Props> = ({ratingsHistory}) => {
  let minRating = 4000
  let maxRating = 0
  ratingsHistory.forEach((history) => {
    history.rating_history.forEach((day) => {
      minRating=Math.min(minRating, day.rating)
      maxRating=Math.max(maxRating, day.rating)
    })
  })
  if(minRating>maxRating) maxRating=4000, minRating=0

  let minDateUNIX = 1704078000 //hardcoded 2024/01/01
  ratingsHistory.forEach((history) => {
    history.rating_history.forEach((day) => {
      minDateUNIX=Math.min(minDateUNIX, day.dateUNIX)
    })
  })
  const currentDateUnix = Date.now()/1000

  const minVerticalValue = Math.max(Math.min(800, minRating-100),0)
  const maxVerticalValue = Math.min(4200 ,Math.max(1500, maxRating+300+(maxRating%100==0 ? + 35 : 0)))
  const minHorizontalValue = minDateUNIX-100000
  const maxHorizontalValue = currentDateUnix+100000

  const fullFillValues = ["#AA0000", "#FF3333", "#FF7777", "#FFBB55", "#FFCC88", "#FF88FF", "#AAAAFF", "#77DDBB", "#77FF77", "#CCCCCC"]
  const fullVerticalValues = [1200,1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000]
  const verticalTickValues: number[] = fullVerticalValues.filter((v) => v<maxVerticalValue)
  const horizontalFillValues: string[] = fullFillValues.slice(-verticalTickValues.length-1)

  const userColorsOptions = ["yellow", "black", "#FF9100", "#28AB14", "#003CFF", "#C400FF", "#14ABA1", "#FF00B3"]
  const userColor: Record<string, string> = {}
  for(let idx = 0; idx<ratingsHistory.length; idx++){
    userColor[ratingsHistory[idx].handle] = userColorsOptions[idx%userColorsOptions.length]
  }

  return (
    <>
    <Card className="mt-4">
      <ResponsiveContainer width="100%" height={400} className="mt-4 mb-2">
        <ScatterChart
          margin={{
            top: 0,
            right: 20,
            bottom: 0,
            left: 20,
          }}
        >
          <CartesianGrid vertical={true} syncWithTicks={true} horizontalFill={horizontalFillValues}/>
          <XAxis
            dataKey="dateUNIX"
            name="date"
            type="number"
            domain={[minHorizontalValue, maxHorizontalValue]}
            tickLine={true}
            axisLine={true}
            tickMargin={8}
            tickCount={10}
            tickFormatter={(value) => {
              const date = new Date(value*1000)
              return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })
            }}
          />
          <YAxis 
            type="number" 
            dataKey="rating" 
            name="rating" 
            ticks={verticalTickValues}
            interval={0}
            domain={[minVerticalValue, maxVerticalValue]}
            width={25}
          />
          <ZAxis range={[30,30]}/>
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            formatter={(value: number, name: string) => {
              if(name=="date"){
                const date = new Date(value*1000)
                return date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })
              }
              else return value
            }}
            labelFormatter={() => ""}
            content={({active, payload, label}) => {
              console.log("payload:")
              console.log(label)
              if(active && payload){
                const user = payload[0].payload.handle
                const rating = payload[0].payload.rating
                const dateUNIX = payload[0].payload.dateUNIX
                const date = new Date(dateUNIX*1000)
                return (
                  <div>
                    <Card className="p-2">
                      <p><b>{user}: {rating}</b></p>
                      <p>{date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                      </p>
                    </Card>
                  </div>
                )
              }
              return null
            }}
            
          />
          <Legend formatter={(value) => <span className="text-black italic">{value}</span>}/>
          {
            ratingsHistory.map((history) => 
              <Scatter key={history.handle} id={history.handle} name={history.handle} data={history.rating_history} 
              fill={userColor[history.handle]} line={{stroke: userColor[history.handle], strokeWidth: 2}} shape="circle" isAnimationActive={false}/>
            )
          }
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
    </>
  )
}
