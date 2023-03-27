import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { SurveyService } from '../../services/survey.service'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-auth-survey-responses',
  templateUrl: './survey-responses.component.html',
  styleUrls: ['./survey-responses.component.scss'],
})
export class SurveyResponsesComponent implements OnInit {
  courseId!: String
  surveyId!: string
  surveyViewData: any

  // afterSubmitLink = '/page/home'
  apiData: {
    // tslint:disable-next-line:prefer-template
    getAPI: string;
    postAPI: string;
    getAllApplications: string;
    customizedHeader: {};
  } | undefined
  isReadOnly = true
  selectedUserActive: any
  overallList: any
  userListItem: any

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private surveySvc: SurveyService,
    private snackBar: MatSnackBar,
  ) {
    this.route.params.subscribe(params => {
      this.surveyId = params['surveyId']
      this.courseId = params['courseId']
    })

    // tslint:disable-next-line:no-non-null-assertion
    this.overallList = this.router.getCurrentNavigation() !== null ? this.router.getCurrentNavigation()!.extras.state : []
    this.userListItem = this.overallList && this.overallList.responsesList.length > 0 ? this.overallList.responsesList : []

    if (this.userListItem && this.userListItem.length > 0) {
      this.viewSurvey(this.userListItem[0])
    } else {

      const survObj = {
        searchObjects: [
          {
            key: 'formId',
            values: this.surveyId,
          },
        ],
      }
      this.surveySvc.fetchAttachedCourses(survObj).subscribe(
        res => {
          this.userListItem = res.responseData
          // tslint:disable-next-line:max-line-length
          this.userListItem = this.userListItem.filter((it: any) => it.dataObject['Course ID and Name'] && it.dataObject['Course ID and Name'].split(',')[0] === this.courseId)

          // this.userListItem = this.userListItem.filter((it: any) => {
          //   if (it.dataObject['Course ID and Name']) {
          //     const id = it.dataObject['Course ID and Name']
          //     const valid = id.split(',')
          //     // tslint:disable-next-line:no-unused-expression
          //     valid[0] === this.courseId
          //   }
          // })

          // console.log('this.userListItem', this.userListItem)
          if (this.userListItem && this.userListItem.length > 0) {
            this.userListItem.sort((x: any, y: any) => {
              return y.timestamp - x.timestamp
            })
            this.viewSurvey(this.userListItem[0])
          }
        },
        err => {
          // tslint:disable-next-line: no-console
          console.log('Error in fetching courses', err)
          this.openSnackbar('Error in fetching attached courses for this survey!')
          // this.loaderService.changeLoad.next(false)
        },
        // () => this.loaderService.changeLoad.next(false)
      )
    }
  }

  ngOnInit() {
  }

  viewSurvey(item: any) {
    this.selectedUserActive = item.applicationId
    this.surveyViewData = item
    this.apiData = {
      // tslint:disable-next-line:prefer-template
      getAPI: '/apis/proxies/v8/forms/getFormById?id=' + item.formId,
      postAPI: '/apis/proxies/v8/forms/v1/saveFormSubmit',
      getAllApplications: '/apis/proxies/v8/forms/getAllApplications',
      customizedHeader: {},
    }
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}
