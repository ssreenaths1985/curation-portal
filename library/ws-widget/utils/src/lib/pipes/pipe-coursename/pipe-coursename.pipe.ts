import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'pipeCourseName',
})
export class PipeCourseNamePipe implements PipeTransform {

  transform(value: any) {
    const fullname = value.split(',')

    return fullname[1]
  }

}
