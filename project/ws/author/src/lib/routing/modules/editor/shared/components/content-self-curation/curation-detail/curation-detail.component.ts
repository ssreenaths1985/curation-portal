import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
/* tslint:disable */
import _ from 'lodash'
// import { NSISelfCuration } from '../../../../../../../interface/self-curation'
// import { SelfCurationService } from '../../../services/self-curation.service'
/* tslint:enable */
export interface ICurationDetail {
  parentName: string
  parentId: string
  resourseName: string
  progressData: any
}
@Component({
  selector: 'ws-auth-curation-detail',
  templateUrl: './curation-detail.component.html',
  styleUrls: ['./curation-detail.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class CurationDetailComponent implements OnInit, OnDestroy {
  // @Input() parentName = 'CBP'
  // @Input() parentId = ''
  // @Input() resourseName = ''
  // @Input() progressData!: NSISelfCuration.ISelfCurationData
  localdata!: any
  pdfData: any
  //   {
  //     pdfUrl: string,
  //     hideControls: boolean
  //   } | null = null
  constructor(
    public dialogRef: MatDialogRef<CurationDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICurationDetail,
  ) {
  }
  ngOnInit(): void {
    // this.pdfData = {
    //   widgetType: 'player',
    //   widgetSubType: 'playerPDF',
    //   widgetData: {
    //     pdfUrl: 'https://d136953gtttd92.cloudfront.net/content-store/igot/dopt/Public/
    // lex_auth_01319481875546112087/artifacts/introduction_11610695618313.pdf',
    //     identifier: this.data.parentId,
    //     disableTelemetry: true,
    //     hideControls: true,
    //   },
    // }
    this.localdata = { ...this.data }
    const data1: any = []
    _.each(_.groupBy(_.get(this.localdata.progressData, 'profanityWordList'), 'word'), aa => {
      const a = _.first(aa)
      aa.shift()
      _.each(aa, bb => {
        a.pageOccurred.push(...bb.pageOccurred)
      })
      data1.push(a)
    })
    _.set(this.localdata.progressData, 'profanityWordList', data1)
  }

  get getImageIssues(): number {
    let count = 0
    if (
      this.localdata.progressData && this.localdata.progressData.profanityImageAnalysisMap &&
      Object.keys(this.localdata.progressData.profanityImageAnalysisMap).length > 0
    ) {
      Object.keys(this.localdata.progressData.profanityImageAnalysisMap).forEach(element => {
        if (this.localdata.progressData.profanityImageAnalysisMap[element].length > 0) {
          this.localdata.progressData.profanityImageAnalysisMap[element].forEach((subEle: any) => {
            if (subEle.classification === 'Offensive') {
              count += 1
            }
          })
        }
      })
      return count
    }
    return 0
  }

  get getImageData() {
    const tempArryaData: any[] = []
    if (this.localdata.progressData && this.localdata.progressData.profanityImageAnalysisMap &&
      Object.keys(this.localdata.progressData.profanityImageAnalysisMap).length > 0) {
      Object.keys(this.localdata.progressData.profanityImageAnalysisMap).forEach(element => {
        this.localdata.progressData.profanityImageAnalysisMap[element].forEach((subEle: any) => {
          if (subEle.classification === 'Offensive') {
            subEle['pageNo'] = element
            tempArryaData.push(this.localdata.progressData.profanityImageAnalysisMap[element])
          }
        })
      })
      return tempArryaData
    }
    return []
  }

  get getMapIssues(): number {
    let count = 0
    if (
      this.localdata.progressData && this.localdata.progressData.indiaMapClassification &&
      Object.keys(this.localdata.progressData.indiaMapClassification).length > 0
    ) {
      Object.keys(this.localdata.progressData.indiaMapClassification).forEach(element => {
        if (this.localdata.progressData.indiaMapClassification[element].length > 0) {
          this.localdata.progressData.indiaMapClassification[element].forEach((subEle: any) => {
            if (!subEle.is_india_map_detected) {
              count += 1
            }
          })
        }
      })
      return count
    }
    return 0
  }

  get getMapData() {
    const tempArryaData: any[] = []
    if (this.localdata.progressData && this.localdata.progressData.indiaMapClassification &&
      Object.keys(this.localdata.progressData.indiaMapClassification).length > 0) {
      Object.keys(this.localdata.progressData.indiaMapClassification).forEach(element => {
        this.localdata.progressData.indiaMapClassification[element].forEach((subEle: any) => {
          if (!subEle.is_india_map_detected) {
            subEle['pageNo'] = element
            tempArryaData.push(this.localdata.progressData.indiaMapClassification[element])
          }
        })
      })
      return tempArryaData
    }
    return []
  }

  ngOnDestroy(): void {

  }

  onNoClick(): void {
    this.dialogRef.close()
  }
  get getPotentialIssues(): number {
    if (this.data.progressData && this.data.progressData.profanity_word_count > 0) {
      // return _.chain(this.data.progressData).get('profanityWordList')
      //   .filter(i => i.category === 'offensive' || i.category === 'lightly offensive')
      //   .sumBy('no_of_occurrence').value()
    }
    return 0
  }
  get getCriticalIssues(): number {
    if (this.data.progressData && this.data.progressData.profanity_word_count > 0) {
      // return _.chain(this.data.progressData).get('profanityWordList')
      //   .filter(i => i.category === 'exptermly offensive')
      //   .sumBy('no_of_occurrence').value()
    }
    return 0
  }

  get getFileName(): string | undefined {
    if (this.data.progressData.primaryKey && this.data.progressData.primaryKey.pdfFileName) {
      return _.get(this.data.progressData, 'primaryKey.pdfFileName')
    }
    return ''
  }

}
