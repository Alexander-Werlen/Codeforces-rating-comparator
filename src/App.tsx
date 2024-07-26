import { useState, useRef } from "react"
import {Graph} from "./components/Graph.tsx"
import { FormSection } from "./components/FormSection.tsx"
import { TableSection } from "./components/TableSection.tsx"
import unix2date from "./services/auxiliar/unix2date.ts"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { getDaysArray } from "./services/auxiliar/getDaysArray.ts"

type RatingHistory = Record<string, string | number>[]
type Contest = {
  contestId: number,
  contestName: string,
  handle: string,
  rank: number,
  ratingUpdateTimeSeconds: number,
  oldRating: number,
  newRating: number
}
type RatingsPerDayType = Record<string, Record<string, string | number>>
type UserData = {
  handle: string,
  current_rating: number,
  peak_rating: number,
  peak_rating_date: string
}

function App() {

  async function addUserRatingHistory(newHandle: string | null){
    if(!newHandle) {
      setLoadingNewUser(false)
      return
    }
    if(selectedUsers.includes(newHandle)) {
      toast({
        variant: "default",
        title: "USER WAS PREVIOUSLY ADDED",
        description: `User "${newHandle}" was already added`,
      })
      setLoadingNewUser(false)
      return
    }

    const url = "https://codeforces.com/api/user.rating?handle=".concat(newHandle)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
  
      const json = await response.json()
      const newUserContests: Contest[] =  json.result
      
      //computing first date
      let minDate = "2024-01-01"
      newUserContests.forEach((contest) => {
        const contestDate = unix2date(contest.ratingUpdateTimeSeconds)
        if(contestDate < minDate) minDate = contestDate
      })
      ratingHistory.forEach((day) => {
        if(day.date < minDate && typeof day.date == "string") minDate = day.date
      })
      
      const daylist = getDaysArray(new Date(minDate),new Date()).map((date)=>date.toISOString().slice(0,10));
      
      //computing new ratings per day data
      const ratingsPerDay: RatingsPerDayType = {}
      daylist.forEach((day) => {
        ratingsPerDay[day] = {date: day}
      })
      ratingHistory.forEach((dayData) => {
        ratingsPerDay[dayData.date] = dayData
      })
      newUserContests.forEach((contest) => {
        const contestDate = unix2date(contest.ratingUpdateTimeSeconds)
        ratingsPerDay[contestDate][newHandle] = contest.newRating
      })

      // filling days without data with previous rating
      for(let i = 0; i<daylist.length; i++){
        const day = daylist[i]
        if(!(newHandle in ratingsPerDay[day])){
          if(i>0) ratingsPerDay[day][newHandle] = ratingsPerDay[daylist[i-1]][newHandle]
          else ratingsPerDay[day][newHandle] = 0
        }
        selectedUsers.forEach((handle) => {
          if(!(handle in ratingsPerDay[day])){
            if(i>0) ratingsPerDay[day][handle] = ratingsPerDay[daylist[i-1]][handle]
            else ratingsPerDay[day][handle] = 0
          }
        })
      }

      setRatingHistory(daylist.map((day) => ratingsPerDay[day]))
      setSelectedUsers((users) => [...users, newHandle])
      toast({
        variant: "default",
        title: "NEW USER ADDED",
        description: `User "${newHandle}" added successfully`,
      })

      //getting table data of user
      let current_rating = 0
      let peak_rating = -1
      let peak_rating_date = "01/01/2024"
      newUserContests.forEach((contest) => {
        current_rating=contest.newRating
        if(contest.newRating>peak_rating){
          peak_rating=contest.newRating
          peak_rating_date = unix2date(contest.ratingUpdateTimeSeconds)
        }
      })
      setUsersData((prevState) => prevState.concat({
        handle: newHandle,
        current_rating: current_rating,
        peak_rating: peak_rating,
        peak_rating_date: peak_rating_date
      }))
  
    } catch (error) {
      console.error((error as Error).message);
      toast({
        variant: "destructive",
        title: "ERROR",
        description: `Couldn't get data of user "${newHandle}"`,
      })
    }
    setLoadingNewUser(false)
  }

  function deleteUser(handle: string){
    setSelectedUsers((users) => users.filter((u) => u!=handle))
    setUsersData((users) => users.filter((u) => u.handle!=handle))
  }

  const initialRatingHistory: RatingHistory = []
  const initialUsers: string[] = []
  const initialUsersData: UserData[] = []

  const [selectedUsers, setSelectedUsers] = useState(initialUsers)
  const [ratingHistory, setRatingHistory] = useState(initialRatingHistory)
  const [usersData, setUsersData] = useState(initialUsersData)
  const [loadingNewUser, setLoadingNewUser] = useState(false)

  const { toast } = useToast()

  const newHandle = useRef<HTMLInputElement>(null)

  //computing min and max ratings
  let minRating = 4000
  let maxRating = 0
  ratingHistory.forEach((day) => {
    selectedUsers.forEach((handle) => {
      if(typeof day[handle] == "number") minRating = Math.min(minRating, day[handle]), maxRating=Math.max(maxRating, day[handle])
      })
  })
  if(minRating>maxRating) maxRating=4000, minRating=0

  //form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!newHandle.current?.value) return
    setLoadingNewUser(true)
    addUserRatingHistory(newHandle.current.value)
    newHandle.current.value = ""
  }

  return (
    <>
    <div className="container">
      <h1 className="text-center text-2xl sm:text-4xl font-bold mt-6 font-serif">
        CODE<span className="text-blue-800">FORCES</span>
        <br/>
        Rating Comparator
      </h1>
      <FormSection handleSubmit={handleSubmit} newHandle={newHandle} loadingNewUser={loadingNewUser}/>
      <Graph ratingHistory={ratingHistory} users={selectedUsers} minRating={minRating} maxRating={maxRating}/>
      <TableSection tableData={usersData} deleteUser={deleteUser}/>
    </div>
    <Toaster />
    </>
  )
}

export default App
