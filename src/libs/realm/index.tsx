import { Realm, createRealmContext } from '@realm/react'
import { Historic } from './schemas/historic'

export const {
  RealmProvider, 
  useRealm, 
  useObject,
  useQuery
} = createRealmContext({
  schema: [Historic]
})

const realmAccessBehavior: Realm.OpenRealmBehaviorConfiguration = {
  type: Realm.OpenRealmBehaviorType.OpenImmediately
}

export const syncConfig: any = {
  flexible: true,
  newRealmFileBehavior: realmAccessBehavior,
  existingRealmFileBehavior: realmAccessBehavior, 
}
