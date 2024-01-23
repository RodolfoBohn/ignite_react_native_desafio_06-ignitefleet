import { createRealmContext } from '@realm/react'
import { Historic } from './schemas/historic'

export const {
  RealmProvider, 
  useRealm, 
  useObject,
  useQuery
} = createRealmContext({
  schema: [Historic]
})