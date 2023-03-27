import { Pipe, PipeTransform } from '@angular/core'
import { environment } from '../../../../../../../src/environments/environment'

@Pipe({
  name: 'PipeNicRelative',
})
export class PipeNicRelativePipe implements PipeTransform {

  transform(value: any): string {
    return value ? this.generateUrl(value) : ''

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
}
