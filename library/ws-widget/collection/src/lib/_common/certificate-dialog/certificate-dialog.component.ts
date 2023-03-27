import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { SafeHtml } from '@angular/platform-browser'

@Component({
  selector: 'ws-widget-certificate-dialog',
  templateUrl: './certificate-dialog.component.html',
  styleUrls: ['./certificate-dialog.component.scss'],
})
export class CertificateDialogComponent implements OnInit {
  @ViewChild('dataContainer', { static: true }) dataContainer!: ElementRef
  url!: string
  svg!: SafeHtml
  xmlData!: string
  constructor(
    public dialogRef: MatDialogRef<CertificateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data.cet) {
      this.url = data.cet
    }
    if (data.base64) {
      this.url = data.base64
    }
  }

  ngOnInit() {
    // this.url = this.data.url
    // this.svg = this.sanitizer.bypassSecurityTrustHtml(this.url)

    // this.url = require(`!!raw-loader?!..${this.data.url}`).default as string
    // this.dataContainer.nativeElement.widget = 500
    // this.dataContainer.nativeElement.innerHTML = this.svg
  }

  dwonloadCert() {
    const a: any = document.createElement('a')
    a.href = this.data.cet
    a.download = 'çertificate'
    document.body.appendChild(a)
    a.style = 'display: none'
    a.click()
    a.remove()
  }
}
