import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AddUsersFormMetaComponent } from './components/add-users-form-meta/add-users-form-meta.component'
import { AllContentComponent } from './components/all-content/all-content.component'
import { MyContentComponent } from './components/my-content/my-content.component'
import { UserHomePageComponent } from './components/users-home-page/users-home-page.component'
import { MandatoryContentResolverService } from './resolvers/mandatory-content-resolver.service'

const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'me',
  },
  {
    path: 'me',
    component: MyContentComponent,
    resolve: {
      // courseTaken: MandatoryContentResolverService,
    },
  },
  {
    path: 'all',
    component: AllContentComponent,
    resolve: {
      // courseTaken: MandatoryContentResolverService,
    },
  },
  {
    path: 'users',
    component: UserHomePageComponent,
    resolve: {
      // courseTaken: MandatoryContentResolverService,
    },
  },
  {
    path: 'users-form-meta',
    component: AddUsersFormMetaComponent,
    resolve: {
      // courseTaken: MandatoryContentResolverService,
    },
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [MandatoryContentResolverService],
})
export class MyContentRoutingModule { }
