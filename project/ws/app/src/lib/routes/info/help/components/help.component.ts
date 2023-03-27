
import { Component, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ConfigurationsService, NsPage, PipeDurationTransformPipe } from '@ws-widget/utils'

/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */

@Component({
  selector: 'ws-help-content',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  providers: [PipeDurationTransformPipe],
})

export class HelpComponent implements OnInit, OnDestroy {

  pageNavbar: Partial<NsPage.INavBackground> = this.configService.pageNavBar
  introVideo: SafeResourceUrl | null = null
  pdfData: SafeResourceUrl | null = null
  pdfFileDownload: SafeResourceUrl | null = null

  constructor(
    private domSanitizer: DomSanitizer,
    private configService: ConfigurationsService,
  ) { }

  ngOnDestroy() {
  }

  ngOnInit() {
    this.introVideo = this.domSanitizer.bypassSecurityTrustResourceUrl(
      '/assets/videos/CBP-portal-tour.mp4'
    )
    this.pdfData = this.domSanitizer.bypassSecurityTrustResourceUrl(
      '/assets/images/sample/sample-pdf.png'
    )
    this.pdfFileDownload = this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/pfds/CBP-Portal-User-manual.pdf')
  }

  changeToDefaultImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/default.png'
  }
}
