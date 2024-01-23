import {Realm} from '@realm/react'

interface HistoricGenerateProps {
  user_id: string
  description: string
  license_plate: string
}

export class Historic extends Realm.Object<Historic> {
  _id!: string
  user_id!: string
  description!: string
  license_plate!: string
  status!: string
  created_at!: Date
  updated_at!: Date


  static generate({description, license_plate, user_id}: HistoricGenerateProps) {
    return {
      _id: new Realm.BSON.UUID(),
      user_id,
      description, 
      license_plate, 
      status: "departure",
      created_at: new Date(), 
      updated_at: new Date()
    }
  }

  static schema = {
    name: "Historic", 
    primaryKey: "_id",
    properties: {
      _id: "uuid", 
      user_id: "string",
      license_plate: "string", 
      description: "string", 
      status: "string", 
      created_at: "date", 
      updated_at: "date"
    }
  }
}