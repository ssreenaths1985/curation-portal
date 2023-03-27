import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PageResolve } from '@ws-widget/utils'
import { ContentDetailComponent } from './components/content-detail/content-detail.component'
import { ContentDetailHomeComponent } from './components/content-detail-home/content-detail-home.component'
// import { ContentInsightsComponent } from './components/content-Insights/content-Insights.component'
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { ContentRatingComponent } from './components/content-rating/content-rating.component'
import { ContentCompetenciesComponent } from './components/content-competencies/content-competencies.component'
import { ContentContentComponent } from './components/content-content/content-content.component'
import { ContentBatchesComponent } from './components/content-batches/content-batches.component'
import { ContentCreateBatchComponent } from './components/content-create-batch/content-create-batch.component'
import { ContentBatchDetailComponent } from './components/content-batch-detail/content-batch-detail.component'
import { ContentLearnersComponent } from './components/content-learners/content-learners.component'
import { ContentCertificatesComponent } from './components/content-certificates/content-certificates.component'
import { ContentDiscussionComponent } from './components/content-discussion/content-discussion.component'
import { ContentAssessmentsComponent } from './components/content-assessments/content-assessments.component'
import { ContentNotificationsComponent } from './components/content-notifications/content-notifications.component'
import { ContentBatchSettingsComponent } from './components/content-batch-settings/content-batch-settings.component'
import { ContentLearnerDetailComponent } from './components/content-learner-detail/content-learner-detail.component'
import { ContentCertificatesHomeComponent } from './components/content-certificates-home/content-certificates-home.component'
import { ContentCertificateLearnersComponent } from './components/content-certificate-learners/content-certificate-learners.component'
import { BatchLearnersResolverService } from './resolvers/batch-lrns-resolver.servece'
import { ContentInsightsRainComponent } from './components/content-insights-rain/content-insights-rain.component'
// import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
// import { GeneralGuard } from '../../../../../../../../../../src/app/guards/general.guard'

const routes: Routes = [
  {
    path: '',
    component: ContentDetailHomeComponent,
    data: {
      pageType: 'feature',
      pageKey: 'content-detail',
    },
    resolve: {
      pageData: PageResolve,
    },
    // redirectTo:
    children: [
      {
        path: ':contentId',
        // component: ContentDetailComponent,
        resolve: {
          content: AppTocResolverService,
        },
        runGuardsAndResolvers: 'always',
        // pathMatch: 'full',
        // redirectTo: 'overview',
        children: [
          {
            path: 'overview',
            component: ContentDetailComponent,
          },
          {
            path: 'content',
            component: ContentContentComponent,
          },
          {
            path: 'compentencies',
            component: ContentCompetenciesComponent,
          },
          {
            path: 'insights',
            component: ContentInsightsRainComponent,
            data: {
              pageType: 'feature',
              pageKey: 'toc',
              // requiredFeatures: ['tocAnalytics'],
            },
            resolve: {
              // pageData: PageResolve,
              // content: AppTocResolverService,
            },
            // canActivate: [GeneralGuard],
            // runGuardsAndResolvers: 'always',
          },
          {
            path: 'ratings',
            component: ContentRatingComponent,
          },
          {
            path: 'notifications',
            component: ContentDetailComponent,
          },
          {
            path: 'new-batch',
            component: ContentCreateBatchComponent,
          },
          {
            path: 'batches',
            component: ContentBatchesComponent,
          },
          {
            path: 'batches/:batch',
            component: ContentBatchDetailComponent,
            data: {
              pageType: 'feature',
              pageKey: 'content-detail',
            },
            resolve: {
              pageData: PageResolve,
            },
            children: [
              {
                path: 'learner/:id',
                component: ContentLearnerDetailComponent,
              },
              {
                path: 'learners',
                component: ContentLearnersComponent,
              },
              {
                path: 'certificates',
                component: ContentCertificatesHomeComponent,
                children: [{
                  path: 'cert-home',
                  component: ContentCertificatesComponent,
                },
                {
                  path: 'view-learners/:certificate',
                  component: ContentCertificateLearnersComponent,
                  resolve: {
                    learners: BatchLearnersResolverService,
                  },
                },
                {
                  path: '',
                  pathMatch: 'full',
                  redirectTo: 'cert-home',
                },
                ],
              },
              {
                path: 'discuss',
                component: ContentDiscussionComponent,
              },
              {
                path: 'assessments',
                component: ContentAssessmentsComponent,
              },
              {
                path: 'notifications',
                component: ContentNotificationsComponent,
              },
              {
                path: 'batch-settings',
                component: ContentBatchSettingsComponent,
              },
              {
                path: '',
                redirectTo: 'learners',
              },
            ],
          },
          {
            path: '',
            redirectTo: 'overview',
          },
        ],
      },
    ],
  },
]
// export const routingConfiguration: ExtraOptions = {
//   paramsInheritanceStrategy: 'always',
// }
@NgModule({
  imports: [RouterModule.forChild(routes)],
  // providers: [],
  exports: [RouterModule],
})
export class MyContentRoutingModule { }
