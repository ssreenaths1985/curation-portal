import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ICompLevel } from './add-comp.model'

@Component({
  selector: 'ws-auth-add-comp-level-dialog',
  templateUrl: './add-comp-level.component.html',
  styleUrls: ['./add-comp-level.component.scss'],
})
export class AddCompLevelComponent implements OnInit {
  takeToAnotherLink = false
  competencyLevelForm!: FormGroup
  levels = [
    { text: 'Level 1', value: 'Level 1' },
    { text: 'Level 2', value: 'Level 2' },
    { text: 'Level 3', value: 'Level 3' },
    { text: 'Level 4', value: 'Level 4' },
    { text: 'Level 5', value: 'Level 5' },
    { text: 'Level 6', value: 'Level 6' },
    { text: 'Level 7', value: 'Level 7' },
    { text: 'Level 8', value: 'Level 8' },
    { text: 'Level 9', value: 'Level 9' },
    { text: 'Level 10', value: 'Level 10' },

  ]
  @ViewChild('savebtn', { read: ElementRef, static: false }) public savebtn!: ElementRef
  @ViewChild('description', { read: ElementRef, static: true }) public descriptionRef!: ElementRef

  constructor(
    public dialogRef: MatDialogRef<AddCompLevelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICompLevel,
  ) {

  }
  ngOnInit() {
    this.competencyLevelForm = new FormGroup({
      level: new FormControl(this.data.level || '', [Validators.required]),
      name: new FormControl(this.data.name || ''),
      description: new FormControl(this.data.description || '', [Validators.required, Validators.minLength(100)]),
    })
  }

  onSubmit() {
    if (this.competencyLevelForm.valid) {
      this.dialogRef.close({
        result: this.competencyLevelForm.value,
      })
    } else {
      this.rejected()
    }
  }
  rejected() {
    this.dialogRef.close({
      result: false,
    })
  }
  onKeydown(event: Event) {
    event.preventDefault()
  }
  onKeyup(event: Event) {
    event.preventDefault()
    this.descriptionRef.nativeElement.value += '\n• '
    const textValue = this.descriptionRef.nativeElement.value

    if (textValue.substr(textValue.length - 1) === '\n') {
      this.descriptionRef.nativeElement.nativeElement.value = textValue.substring(0, textValue.length - 1)
    }
  }
  focus(event: Event) {
    event.preventDefault()
    if (this.descriptionRef.nativeElement.value === '') {
      this.descriptionRef.nativeElement.value += '• '
    }

  }

}
