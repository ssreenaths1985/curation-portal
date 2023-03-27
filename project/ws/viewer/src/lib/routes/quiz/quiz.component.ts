import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { HttpBackend, HttpClient } from '@angular/common/http'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { NSQuiz } from '../../plugins/quiz/quiz.model'
import { ActivatedRoute } from '@angular/router'
import { WsEvents, EventService } from '@ws-widget/utils'
import { ViewerUtilService } from '../../viewer-util.service'
import { environment } from '../../../../../../../src/environments/environment'

@Component({
  selector: 'viewer-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription | null = null
  isFetchingDataComplete = false
  forPreview = window.location.href.includes('/author/') || window.location.href.includes('?preview=true')
  isErrorOccured = false
  quizData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  quizJson: Partial<NSQuiz.IQuiz> = {
    timeLimit: 0,
    questions: [],
    isAssessment: false,
  }
  constructor(
    private activatedRoute: ActivatedRoute,
    private httpBackend: HttpBackend,
    private contentSvc: WidgetContentService,
    private eventSvc: EventService,
    private viewSvc: ViewerUtilService,
  ) { }

  ngOnInit() {
    this.dataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.quizData = data.content.data
        if (this.quizData) {
          this.quizData.artifactUrl = this.getUrl(this.generateUrl(this.quizData.artifactUrl))
        }
        if (this.alreadyRaised && this.oldData) {
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
        }

        // if (this.quizData && this.quizData.artifactUrl.indexOf('content-store') >= 0) {
        //   await this.setS3Cookie(this.quizData.identifier)
        // }
        if (this.quizData) {
          this.quizJson = await this.transformQuiz(this.quizData)
        }
        if (this.quizData) {
          this.oldData = this.quizData
          this.alreadyRaised = true
          // this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.quizData)
        }
        this.isFetchingDataComplete = true
      },
      () => { },
    )
  }

  async ngOnDestroy() {
    if (this.activatedRoute.snapshot.queryParams.collectionId &&
      this.activatedRoute.snapshot.queryParams.collectionType
      && this.quizData) {
      await this.contentSvc.continueLearning(
        this.quizData.identifier,
        this.activatedRoute.snapshot.queryParams.collectionId,
        this.activatedRoute.snapshot.queryParams.collectionType,
      )
    } else if (this.quizData) {
      await this.contentSvc.continueLearning(this.quizData.identifier)
    }
    if (this.quizData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.quizData)
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
  }
  generateUrl(oldUrl: string) {
    const chunk = oldUrl.split('/')
    const newChunk = environment.azureHost.split('/')
    const newLink = []
    for (let i = 0; i < chunk.length; i += 1) {
      if (i === 2) {
        newLink.push(newChunk[i])
      } else if (i === 3) {
        newLink.push(environment.azureBucket)
      } else {
        newLink.push(chunk[i])
      }
    }
    const newUrl = newLink.join('/')
    return newUrl
  }
  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (this.forPreview) {
      return
    }
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'quiz',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.QUIZ,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }

  private async transformQuiz(content: NsContent.IContent): Promise<NSQuiz.IQuiz> {
    // const artifactUrl = this.forPreview
    //   ? this.viewSvc.getAuthoringUrl(content.artifactUrl)
    //   : content.artifactUrl
    const artifactUrl = content.artifactUrl
    const newHttpClient = new HttpClient(this.httpBackend)
    let quizJSON: NSQuiz.IQuiz = await newHttpClient
      .get<any>(artifactUrl || '')
      .toPromise()
      .catch((_err: any) => {
        // throw new DataResponseError('MANIFEST_FETCH_FAILED');
      })
    if (this.forPreview && quizJSON) {
      quizJSON = this.viewSvc.replaceToAuthUrl(quizJSON)
    }
    (quizJSON.questions || []).forEach((question: NSQuiz.IQuestion) => {
      if (question.multiSelection && question.questionType === undefined) {
        question.questionType = 'mcq-mca'
      } else if (!question.multiSelection && question.questionType === undefined) {
        question.questionType = 'mcq-sca'
      }
    })
    return quizJSON
  }
  // private async setS3Cookie(contentId: string) {
  //   await this.contentSvc
  //     .setS3Cookie(contentId)
  //     .toPromise()
  //     .catch(() => {
  //       // throw new DataResponseError('COOKIE_SET_FAILURE')
  //     })
  //   return
  // }

  getUrl(url: string) {
    if (url && url.length > 0) {
      const tempData = url.split('content')
      if (url.indexOf(`/collection`) > 0) {
        return `${environment.cbpPortal}${environment.contentBucket}${tempData[tempData.length - 1]}`
      }
      return `${environment.cbpPortal}${environment.contentBucket}/content${tempData[tempData.length - 1]}`
    }
    return url
  }
}
