import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-auth-preview-survey',
  templateUrl: './preview-survey.component.html',
  styleUrls: ['./preview-survey.component.scss'],
})
export class PreviewSurveyComponent implements OnInit {
  surveyId: any
  isReadOnly = true
  apiData: {
    // tslint:disable-next-line:prefer-template
    getAPI: string;
    postAPI: string;
    getAllApplications: string;
    customizedHeader: {};
  } | undefined

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.surveyId = params['survey']
    })

    this.apiData = {
      // tslint:disable-next-line:prefer-template
      getAPI: '/apis/proxies/v8/forms/getFormById?id=' + this.surveyId,
      postAPI: '/apis/proxies/v8/forms/v1/saveFormSubmit',
      getAllApplications: '/apis/proxies/v8/forms/getAllApplications',
      customizedHeader: {},
    }
  }

}
