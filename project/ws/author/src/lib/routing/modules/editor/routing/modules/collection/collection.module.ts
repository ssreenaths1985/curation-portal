import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatTreeModule } from '@angular/material/tree'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { AuthViewerModule } from '@ws/author/src/lib/modules/viewer/viewer.module'
import { EditorSharedModule } from '@ws/author/src/lib/routing/modules/editor/shared/shared.module'
import { CurateModule } from './../curate/curate.module'
import { UploadModule } from './../upload/upload.module'
import { CollectionRoutingModule } from './collection-routing.module'
import { AuthCollectionMatmenuComponent } from './components/auth-collection-matmenu/auth-collection-matmenu.component'
import { AuthEditorOptionsComponent } from './components/auth-editor-options/auth-editor-options.component'
import { AuthTableOfContentsComponent } from './components/auth-table-of-contents/auth-table-of-contents.component'
import { AuthTableTreeLabelComponent } from './components/auth-table-tree-label/auth-table-tree-label.component'
import { CollectionComponent } from './components/collection/collection.component'
import { WebPageModule } from '../web-page/web-page.module'
// import { IapAssessmentModule } from '../iap-assessment/iap-assessment.module'
import { QuizModule } from '../quiz/quiz.module'
import { MatTabsModule } from '@angular/material'
import { CreateModule } from '../../../../create/create.module'
import { PickNameComponent } from './components/auth-table-of-contents/pick-name/pick-name.component'
import { AuthSelectTypeComponent } from './components/auth-select-type/auth-select-type.component'
import { AuthFormMetaComponent } from './components/auth-form-meta/auth-form-meta.component'
import { AuthAssessmentAddQuestionComponent } from './components/auth-assessment-add-question/auth-assessment-add-question.component'
import { AuthAssessmentBasicInfoComponent } from './components/auth-assessment-basic-info/auth-assessment-basic-info.component'
import { AuthAssessmentHomeComponent } from './components/auth-assessment-home/auth-assessment-home.component'
import { AuthAssessmentAddQuestionFormMetaComponent } from './components/auth-assessment-add-question - form-meta/auth-assessment-add-question-form-meta.component'

@NgModule({
  declarations: [
    CollectionComponent,
    AuthTableOfContentsComponent,
    AuthEditorOptionsComponent,
    AuthTableTreeLabelComponent,
    AuthCollectionMatmenuComponent,
    PickNameComponent,
    AuthSelectTypeComponent,
    AuthFormMetaComponent,
    AuthAssessmentAddQuestionComponent,
    AuthAssessmentAddQuestionFormMetaComponent,
    AuthAssessmentBasicInfoComponent,
    AuthAssessmentHomeComponent,
  ],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    SharedModule,
    EditorSharedModule,
    MatTreeModule,
    DragDropModule,
    AuthViewerModule,
    UploadModule,
    CurateModule,
    MatTabsModule,
    WebPageModule,
    QuizModule,
    CreateModule,
  ],
  entryComponents: [PickNameComponent],
})
export class CollectionModule { }
