import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react"

import { TDataFilterParam } from "store/slice/AlgorithmNode/AlgorithmNodeType"

const BoxFilterContext = createContext<{
  filterParam?: TDataFilterParam
  setFilterParam: Dispatch<SetStateAction<TDataFilterParam | undefined>>
}>({ filterParam: undefined, setFilterParam: () => null })

export const useBoxFilter = () => useContext(BoxFilterContext)

export const BoxFilterProvider = ({ children }: PropsWithChildren) => {
  const [filterParam, setFilterParam] = useState<TDataFilterParam>()

  return (
    <BoxFilterContext.Provider value={{ filterParam, setFilterParam }}>
      {children}
    </BoxFilterContext.Provider>
  )
}
