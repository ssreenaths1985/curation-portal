import { IAuthorData } from '@ws-widget/collection/src/public-api'

export interface IBatch {
  batchId: string
  createdFor: []
  endDate: string
  enrollmentEndDate: string
  enrollmentType: string
  name: string
  startDate: string
  status: number
  identifier?: string
  learners?: number
}

export interface IBatchUsersCount {
  batchId: string
  count: number
  learners?: IAuthorData[]
}
export interface IBatchLearnerProgress {
  batchId: string
  courseId: string
  userId: string
  firstName: string
  lastName: string
  name: string
  profileImage: string
  email: string
  designation: string
  department: string
  completionPercentage: number | null
  issuedCertificates: IIssuedCertificates[]
  progress: number
  status: number

}

export interface IIssuedCertificates {
  identifier: string
  lastIssuedOn: string
  name: string
  token: string
}
