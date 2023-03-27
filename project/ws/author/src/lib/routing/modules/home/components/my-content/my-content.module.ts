import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { AtGlanceModule, CardTableModule, PipeContentRouteModule } from '@ws-widget/collection'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { MyContentComponent } from './components/my-content/my-content.component'
import { MyContentRoutingModule } from './my-content-routing.module'
import { MyContentService } from './services/my-content.service'
import { MatSortModule, MatTableModule, MatIconModule, MatPaginatorModule } from '@angular/material'
import { PipeDurationTransformModule } from '@ws-widget/utils'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { AllContentComponent } from './components/all-content/all-content.component'
import { MandatoryContentComponent } from './components/mandatory-content/mandatory-content.component'
import { AddUsersFormMetaComponent } from './components/add-users-form-meta/add-users-form-meta.component'
import { UserHomePageComponent } from './components/users-home-page/users-home-page.component'
import { ListOfUsersComponent } from './components/list-of-users/list-of-users.component'

@NgModule({
  declarations: [MyContentComponent, AllContentComponent, MandatoryContentComponent, AddUsersFormMetaComponent,
    UserHomePageComponent, ListOfUsersComponent],
  imports: [
    CommonModule,
    SharedModule,
    MyContentRoutingModule,
    PipeContentRouteModule,
    PipeDurationTransformModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    CardTableModule,
    WidgetResolverModule,
    AtGlanceModule,
    MatIconModule,
  ],
  providers: [MyContentService],
})
export class MyContentModule { }
