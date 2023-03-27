import { Component, OnInit, Inject, Input } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
// import { Router } from '@angular/router'

export interface IDialogData {
  name: string
}
@Component({
  selector: 'ws-auth-competence-view',
  templateUrl: './competencies-view.component.html',
  styleUrls: ['./competencies-view.component.scss'],
  /* tslint:disable */
  host: { class: 'flex flex-1 margin-right-xs margin-top-xs margin-bottom-s' },
  /* tslint:enable */
})

export class CompetenceViewComponent implements OnInit {
  @Input() isUpdate = false
  levelSelected: any
  constructor(
    public dialogRef: MatDialogRef<CompetenceViewComponent>,
    private sanitized: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public dData: any
  ) { }
  ngOnInit() {
    if (this.dData && this.dData.children && this.dData.children.length > 0) {
      if (this.dData.selectedLevelId) {
        this.levelSelected = this.dData.children.filter((v: any) => v.id === this.dData.selectedLevelId)[0]
      } else {
        this.levelSelected = this.dData.children[0]
      }
      this.dData.children.forEach((element: any) => {
        element['formatedText'] = this.formate(element.description)
      })
    }
  }
  add() {
    this.dialogRef.close({
      id: this.dData.id,
      action: 'ADD',
      childId: (this.levelSelected && Object.keys(this.levelSelected).length > 0) ? this.levelSelected.id : '',
    })
  }
  remove() {
    this.dialogRef.close({
      id: this.dData.id,
      action: 'DELETE',
    })
  }

  formate(text: string): SafeHtml {
    let newText = '<ul class="pl-6">'
    if (text) {
      const splitTest = text.split('•')
      for (let index = 0; index < text.split('•').length; index += 1) {
        const text1 = splitTest[index]
        if (text1 && text1.trim()) {
          newText += `<li>${text1.trim()}</li>`
        }
      }
    }
    newText += `</ul>`
    return this.sanitized.bypassSecurityTrustHtml(newText)
  }
}
