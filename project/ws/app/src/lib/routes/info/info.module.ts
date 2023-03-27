import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { AboutModule } from './about/about.module'
import { ContactModule } from './contact/contact.module'
import { FaqModule } from './faq/faq.module'
import { InfoRoutingModule } from './info-routing.module'
import { QuickTourModule } from './quick-tour/quick-tour.module'
import { AboutVideoModule } from './about-video/about-video.module'
import { HelpModule } from './help/help.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, InfoRoutingModule, AboutModule, ContactModule, FaqModule, QuickTourModule, AboutVideoModule, HelpModule],
})
export class InfoModule { }
