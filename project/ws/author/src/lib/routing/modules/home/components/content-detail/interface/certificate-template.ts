export interface ICertificateTemplate {
  template: string
  identifier: string
  previewUrl: string
  criteria: {
    enrollment: {
      status: number
    }
  }
  name: string
  issuer: {
    name: string
    url: string
  }
  url: string
  signatoryList: [
    {
      image: string
      name: string
      id: string
      designation: string
    }
  ]
}
export interface ICertificate {
  batchId: string
  certTemplates: { [key: string]: ICertificateTemplate }[]
  cert_templates: { [key: string]: ICertificateTemplate }[]
  collectionId: string
  courseId: string
  createdBy: string
  createdDate: string
  createdFor: string[]
  description: string
  endDate: string
  enrollmentEndDate: string
  enrollmentType: string
  id: string
  identifier: string
  mentors: string[]
  name: string
  oldCreatedDate: string | null
  oldEndDate: string | null
  oldEnrollmentEndDate: string | null
  oldStartDate: string | null
  oldUpdatedDate: string | null
  startDate: string
  status: number
  tandc: string | null
  updatedDate: string | null
}
