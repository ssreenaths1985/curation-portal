import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  AtGlanceModule,
  AuthorCardModule,
  BtnPageBackModule,
  CardTableModule,
  LeftMenuModule,
  PipeContentRouteModule,
  UserContentDetailedRatingModule,
  UserContentRatingModule,
  UserImageModule,
  AvatarPhotoModule,
  CertificateDialogModule,
  CardRatingCommentModule,
} from '@ws-widget/collection'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { ContentDetailComponent } from './components/content-detail/content-detail.component'
import { MyContentRoutingModule } from './content-detail-routing.module'
import { MyContentService } from './services/content-detail.service'
import { MatSortModule, MatTableModule, MatTreeModule, MatSlideToggleModule, MatListModule } from '@angular/material'
import { PipeDurationTransformModule, PipeFilterV3Module } from '@ws-widget/utils'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { ContentDetailHomeComponent } from './components/content-detail-home/content-detail-home.component'
import { ContentInsightsComponent } from './components/content-Insights/content-Insights.component'
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { AppTocService } from './services/app-toc.service'
import { MyTocService } from './services/my-toc.service'
import { ContentDiscussionComponent } from './components/content-discussion/content-discussion.component'
import { LocalDataService } from './services/local-data.service'
import { ContentRatingComponent } from './components/content-rating/content-rating.component'
import { CompetenciesModule } from '../competencies/competencies.module'
import { ContentCompetenciesComponent } from './components/content-competencies/content-competencies.component'
import { ContentContentComponent } from './components/content-content/content-content.component'
import { ContentBatchesComponent } from './components/content-batches/content-batches.component'
import { ContentBatcheComponent } from './components/content-batch/content-batch.component'
import { ContentCreateBatchComponent } from './components/content-create-batch/content-create-batch.component'
import { ContentBatchDetailComponent } from './components/content-batch-detail/content-batch-detail.component'
import { ContentAssessmentsComponent } from './components/content-assessments/content-assessments.component'
import { ContentBatchSettingsComponent } from './components/content-batch-settings/content-batch-settings.component'
import { ContentCertificatesComponent } from './components/content-certificates/content-certificates.component'
import { ContentLearnersComponent } from './components/content-learners/content-learners.component'
import { ContentNotificationsComponent } from './components/content-notifications/content-notifications.component'
import { LearnersResolverService } from './resolvers/learners-resolver.service'
import { ContentBatchService } from './services/content-batch.service'
import { ContentBatchAddLearnersComponent } from './components/content-batch-add-learners/content-batch-add-learners.component'
import { OrgUserService } from './services/org-user.service'
import { UserFilterPipe } from './components/content-batch-add-learners/usr-filter.pipe'
import { ContentLearnerDetailComponent } from './components/content-learner-detail/content-learner-detail.component'
import { ContentAddCertificateComponent } from './components/content-certificates/add-certificate/add-certificate.component'
import { AddContentSVGComponent } from './components/content-add-svg/content-add-svg.component'
import { ContentCertificateService } from './services/certificate.service'
import { ContentCertificatesHomeComponent } from './components/content-certificates-home/content-certificates-home.component'
import { ContentCertificateLearnersComponent } from './components/content-certificate-learners/content-certificate-learners.component'
import { BatchLearnersResolverService } from './resolvers/batch-lrns-resolver.servece'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { ContentInsightsRainComponent } from './components/content-insights-rain/content-insights-rain.component'
import { ContentInsightsRainService } from './services/content-insights-rain.service'
import { RainDashboardsModule } from '@sunbird-cb/rain-dashboards'

@NgModule({
  declarations: [
    AddContentSVGComponent,
    ContentAssessmentsComponent,
    ContentAddCertificateComponent,
    ContentBatchAddLearnersComponent,
    ContentBatchSettingsComponent,
    ContentCertificatesComponent,
    ContentCertificatesHomeComponent,
    ContentCertificateLearnersComponent,
    ContentDetailHomeComponent,
    ContentDetailComponent,
    ContentInsightsComponent,
    ContentDiscussionComponent,
    ContentRatingComponent,
    ContentCompetenciesComponent,
    ContentContentComponent,
    ContentBatchesComponent,
    ContentBatcheComponent,
    ContentCreateBatchComponent,
    ContentBatchDetailComponent,
    ContentLearnerDetailComponent,
    ContentLearnersComponent,
    ContentNotificationsComponent,
    UserFilterPipe,
    ContentInsightsRainComponent,
  ],
  imports: [
    AvatarPhotoModule,
    UserImageModule,
    CertificateDialogModule,
    CommonModule,
    SharedModule,
    MyContentRoutingModule,
    CompetenciesModule,
    PipeContentRouteModule,
    PipeDurationTransformModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatListModule,
    CardTableModule,
    LeftMenuModule,
    WidgetResolverModule,
    AtGlanceModule,
    AuthorCardModule,
    UserContentRatingModule,
    UserContentDetailedRatingModule,
    BtnPageBackModule,
    MatTreeModule,
    PipeDurationTransformModule,
    CardRatingCommentModule,
    InfiniteScrollModule,
    PipeFilterV3Module,
    RainDashboardsModule,
  ],
  providers: [
    AppTocService,
    BatchLearnersResolverService,
    ContentBatchService,
    MyContentService,
    AppTocResolverService,
    MyTocService,
    LocalDataService,
    LearnersResolverService,
    ContentCertificateService,
    OrgUserService,
    UserFilterPipe,
    ContentInsightsRainService,
  ],
  entryComponents: [
    AddContentSVGComponent,
    ContentBatchAddLearnersComponent,
    ContentAddCertificateComponent,
  ],
})
export class ContentDetailModule { }
