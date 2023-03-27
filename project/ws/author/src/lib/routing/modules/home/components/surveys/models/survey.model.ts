export namespace NSSurvey {
  export interface ISurvey {
    id?: string,
    version?: string,
    title: string,
    fields: IField[]
    width?: number,
    isRequired?: boolean,
    order?: number
  }

  export interface IField {
    identifier: string,
    refApi?: any,
    logicalGroupCode?: any,
    name: string,
    fieldType?: string,
    values?: IFieldValue[],
    width?: 12,
    isRequired?: false,
    order?: number
  }

  export interface IFieldValue {
    key: string,
    value: string
  }

  export interface ISurveysResponse {
    id: string,
    title: string,
    version: number,
    numberOfRecords: number,
    status: string,
    createdDate: string,
    link: string,
    expand: boolean
  }
}

/**
 * Interface CopyToClipboard params
 */
interface ICopyToClipboard {
  /** HTML reference identifier ```<div id="foo"></div>```  */
  target?: string
  /** String value */
  value?: string
  /** (Optional) message to display in snackbar on success */
  message?: string
}

export const copyToClipboard = async ({ target, message, value }: ICopyToClipboard) => {
  try {
    let copyValue = ''

    if (!navigator.clipboard) {
      throw new Error('Browser don\'t have support for native clipboard.')
    }

    if (target) {
      const node = document.querySelector(target)

      if (!node || !node.textContent) {
        throw new Error('Element not found')
      }

      // tslint:disable-next-line: no-parameter-reassignment
      value = node.textContent
    }

    if (value) {
      copyValue = value
    }

    if (message) {

    }

    return await navigator.clipboard.writeText(copyValue)
    // console.log(message || 'Copied!!!')
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.log(error)
  }
}
