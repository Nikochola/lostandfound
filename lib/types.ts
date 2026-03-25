export type Category = 'ტანსაცმელი' | 'აქსესუარები' | 'სხვა'
export type Status = 'available' | 'returned'

export interface Item {
  id: string
  name: string
  category: Category
  description: string
  location: string
  date: string
  status: Status
  color?: string
  imageUrl?: string
}
