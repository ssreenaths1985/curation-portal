import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeCourseNamePipe } from './pipe-coursename.pipe'
@NgModule({
  declarations: [PipeCourseNamePipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeCourseNamePipe],
})
export class PipeCourseNameModule {
}
