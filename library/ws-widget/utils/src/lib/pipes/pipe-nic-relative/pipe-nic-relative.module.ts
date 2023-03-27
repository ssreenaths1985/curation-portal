import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeNicRelativePipe } from './pipe-nic-relative.pipe'

@NgModule({
  declarations: [PipeNicRelativePipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeNicRelativePipe],
})
export class PipeNicRelativeModule { }
