import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificateDialogComponent } from './certificate-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { EditorQuillModule } from '../../discussion-forum/editor-quill/editor-quill.module'
import { MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSnackBarModule } from '@angular/material'
import { PipeSafeSanitizerModule } from '../../../../../utils/src/public-api'
import { SvgEditorComponent } from './svg-editor/svg-editor.component'

@NgModule({
  declarations: [CertificateDialogComponent, SvgEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorQuillModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    PipeSafeSanitizerModule,
  ],
  exports: [
    CertificateDialogComponent,
  ],
  entryComponents: [CertificateDialogComponent],
})
export class CertificateDialogModule { }
