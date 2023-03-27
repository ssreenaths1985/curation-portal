import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { debounceTime } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'
// import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
// import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { MatDialog, MatSnackBar } from '@angular/material'
import { LoaderService } from '../../../../../../../services/loader.service'
/* tslint:disable*/
import _ from 'lodash'
import { ConfirmDialogComponent } from '../../../../../../../modules/shared/components/confirm-dialog/confirm-dialog.component'
import { QuizStoreService } from '../../../../../editor/routing/modules/quiz/services/store.service'
import { NSSurvey } from '../../models/survey.model'
// import { NotificationComponent } from '../../../../../../../modules/shared/components/notification/notification.component'
import { ActivatedRoute, Router } from '@angular/router'
import { SurveyService } from '../../services/survey.service'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'

@Component({
  selector: 'ws-author-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss'],
})
export class CreateSurveyComponent implements OnInit {
  surveyId = ''
  isEditMode = false
  surveyForm!: FormGroup
  questionList: any = []
  mediumScreen = false
  questionType = ''
  selectedQuestionNode!: string
  questionText!: string
  answerOptions: any = []
  originalSurveyData: any = []
  isEditEnabled = false
  isSaveQuestion = false
  searchValue!: string
  isSubmitted = false

  constructor(
    private formBuilder: FormBuilder,
    // private contentService: EditorContentService,
    private snackBar: MatSnackBar,
    private quizStoreSvc: QuizStoreService,
    // private collectionstoreService: CollectionStoreService,
    // private editorService: EditorService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private surveySvc: SurveyService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.createForm()
  }

  ngOnInit() {
    // TODO: read the survey Data
    this.route.queryParams.subscribe(params => {
      this.surveyId = params['survey']
      this.isEditMode = !!params['mode']
      if (this.isEditMode) {
        this.surveySvc.getSurveyByID(this.surveyId).subscribe(
          res => {
            this.originalSurveyData = res
            // console.log('this.originalSurveyData', this.originalSurveyData)
            this.updateForm()
            this.updateStore()
            this.updateLocalFromStore()
          }
        )
      }
      if (this.isEditMode === false) {
        this.surveySvc.surveyData.fields = []
        this.questionList = []
      }
    })
  }

  createForm() {
    this.surveyForm = this.formBuilder.group({
      title: ['', [Validators.required, this.noWhitespaceValidator]],
    })

    this.surveyForm.valueChanges.pipe(debounceTime(700)).subscribe(() => {
      this.surveySvc.surveyData.title = this.surveyForm.controls['title'].value
    })
    this.surveySvc.surveyData.fields = []
    this.questionList = []
  }

  noWhitespaceValidator(control: any) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0
    const isValid = !isWhitespace
    return isValid ? null : { 'whitespace': true }
  }

  updateForm() {
    this.surveyForm.patchValue({
      title: this.originalSurveyData.title,
    })
  }

  updateStore() {
    this.surveySvc.surveyData = this.originalSurveyData
  }

  addQuestionList() {
    const newUUID = uuidv4()
    const field = {
      name: 'New Question',
      identifier: newUUID,
      fieldType: 'star-rating',
      values: []
    }
    this.questionList.push(field)
    this.surveySvc.addField(field)
    this.questionSelected(field, true)
  }

  async questionSelected(item: any, isManualtriggrer?: boolean) {
    this.selectedQuestionNode = isManualtriggrer ? (item.value || item.identifier) : (item.value || item.identifier)
    this.questionType = ''
    this.questionText = ''
    this.quizStoreSvc.collectiveQuiz[this.selectedQuestionNode] = []
    this.quizStoreSvc.currentId = this.selectedQuestionNode
    this.quizStoreSvc.changeQuiz(0)
    const field = this.surveySvc.getFieldById(this.selectedQuestionNode)
    // const index = this.surveySvc.getFieldIndexById(this.selectedQuestionNode)
    this.assignQuestion(field, 0)
  }

  assignQuestion(metaData: any, listNum: number) {
    if (metaData) {
      const configQuestion = {
        questionId: this.quizStoreSvc.generateQuestionId(listNum),
        questionType: metaData.fieldType,
        questionText: metaData.name === 'New Question' ? '' : metaData.name,
        options: [],
      }
      const questionOptions: any = []
      this.questionType = metaData.fieldType
      this.questionText = metaData.name === 'New Question' ? '' : metaData.name
      if (metaData.values && metaData.values.length > 0) {
        metaData.values.forEach((element: any, index: number) => {
          const configOptions: any = {
            optionId: this.quizStoreSvc.generateOptionId(configQuestion.questionId, index),
            isCorrect: 'false',
            text: element.key,
          }
          questionOptions.push(configOptions)
        })
        configQuestion.options = questionOptions
        this.quizStoreSvc.collectiveQuiz[this.selectedQuestionNode].push(configQuestion)
        // console.log('this.quizStoreSvc.collectiveQuiz', this.quizStoreSvc.collectiveQuiz)
      }
    }
  }

  selectedQuestionType(item: any) {
    this.answerOptions = []
    this.questionText = ''
    this.questionType = item.value
    this.quizStoreSvc.addQuestion(this.questionType)
  }

  updateSelectedQuiz(item: any) {
    this.answerOptions = (item && item.options) ? item.options : []
  }

  saveQuestion(value: boolean) {
    this.isSaveQuestion = value
    this.isSubmitted = false
    this.loaderService.changeLoad.next(true)
    if (this.questionText && (this.questionType === 'mcq-mca' || this.questionType === 'mcq-sca')) {
      if (this.answerOptions.length > 0) {
        // this.answerOptions.forEach((element: any) => {
        //   if (element.text.length === 0) {
        //     this.loaderService.changeLoad.next(false)
        //     this.showTosterMessage('fieldsRequried')
        //   }
        // })
        if (this.answerOptions.length !== this.answerOptions.filter((v: any) => v.match !== '' && v.text !== '').length) {
          this.loaderService.changeLoad.next(false)
          this.showTosterMessage('fieldsRequried')
          return
        }
        this.saveMcq()
        this.loaderService.changeLoad.next(false)
      } else if (this.answerOptions.length === 0) {
        this.loaderService.changeLoad.next(false)
        this.showTosterMessage('fieldsRequried')
      }
    }

    if (this.questionText && this.questionType === 'star-rating') {
      if (this.answerOptions.length > 0) this.answerOptions = []
      this.saveStarRating()
      this.loaderService.changeLoad.next(false)
    }
    if (this.questionText && this.questionType === 'textarea') {
      if (this.answerOptions.length > 0) this.answerOptions = []
      this.saveTextarea()
      this.loaderService.changeLoad.next(false)
    }
    if (!this.questionText || !this.questionType) {
      this.loaderService.changeLoad.next(false)
      this.showTosterMessage('fieldsRequried')
    }
  }

  async saveMcq() {
    if (this.surveySvc.surveyData.fields.filter(e => e.identifier === this.selectedQuestionNode).length <= 0) {
      const choicesValue: { key: any; value: any }[] = []
      this.answerOptions.forEach((element: any, index: number) => {
        choicesValue.push({
          key: element.text,
          value: index,
        })
      })
      const fieldData: NSSurvey.IField = {
        identifier: this.selectedQuestionNode,
        refApi: '',
        logicalGroupCode: '',
        name: this.questionText,
        fieldType: this.questionType,
        values: choicesValue,
        width: 12,
        isRequired: false,
        order: this.questionList.indexOf(this.selectedQuestionNode),
      }
      this.surveySvc.addField(fieldData)
    } else {
      this.surveySvc.surveyData.fields.forEach((element: any, index: number) => {
        if (element.identifier === this.selectedQuestionNode) {
          const choicesValue: { key: any; value: any }[] = []
          this.answerOptions.forEach((ans: any, ansIndex: number) => {
            choicesValue.push({
              key: ans.text,
              value: ansIndex,
            })
          })
          const fieldValue: NSSurvey.IField = {
            ...element,
            name: this.questionText,
            fieldType: this.questionType,
            values: choicesValue,
          }
          this.surveySvc.updateFieldByIndex(index, fieldValue)
          // element.order = this.questionList.indexOf(this.selectedQuestionNode)
        }
      })
    }
    this.updateLocalFromStore()
    this.showTosterMessage('surveyQuestSaved')
  }

  saveStarRating() {
    if (this.surveySvc.surveyData.fields.filter(e => e.identifier === this.selectedQuestionNode).length <= 0) {
      const fieldData: NSSurvey.IField = {
        identifier: this.selectedQuestionNode,
        refApi: '',
        logicalGroupCode: '',
        name: this.questionText,
        fieldType: this.questionType,
        values: [],
        width: 12,
        isRequired: false,
        order: this.questionList.indexOf(this.selectedQuestionNode),
      }
      this.surveySvc.addField(fieldData)
    } else {
      this.surveySvc.surveyData.fields.forEach((element: any, index: number) => {
        if (element.identifier === this.selectedQuestionNode) {
          const fieldValue: NSSurvey.IField = {
            ...element,
            name: this.questionText,
            fieldType: this.questionType,
            values: [],
          }
          this.surveySvc.updateFieldByIndex(index, fieldValue)
        }
      })
    }
    this.updateLocalFromStore()
    this.showTosterMessage('surveyQuestSaved')
  }

  saveTextarea() {
    if (this.surveySvc.surveyData.fields.filter(e => e.identifier === this.selectedQuestionNode).length <= 0) {
      const fieldData: NSSurvey.IField = {
        identifier: this.selectedQuestionNode,
        refApi: '',
        logicalGroupCode: '',
        name: this.questionText,
        fieldType: this.questionType,
        values: [],
        width: 12,
        isRequired: false,
        order: this.questionList.indexOf(this.selectedQuestionNode),
      }
      this.surveySvc.addField(fieldData)
    } else {
      this.surveySvc.surveyData.fields.forEach((element: any, index: number) => {
        if (element.identifier === this.selectedQuestionNode) {
          const fieldValue: NSSurvey.IField = {
            ...element,
            name: this.questionText,
            fieldType: this.questionType,
            values: [],
          }
          this.surveySvc.updateFieldByIndex(index, fieldValue)
        }
      })
    }
    this.updateLocalFromStore()
    this.showTosterMessage('surveyQuestSaved')
  }

  updateLocalFromStore() {
    // after add or update operation on the store is done, update the same in the local value
    this.questionList = []
    this.surveySvc.surveyData.fields.forEach((element: any) => {
      this.questionList.push({
        name: element.name,
        identifier: element.identifier,
        fieldType: element.fieldType,
        values: element.values,
      })
    })
    if (this.isEditMode === true && this.isSaveQuestion === false) {
      this.questionSelected(this.questionList[0], false)
    }
    this.loaderService.changeLoad.next(false)
  }

  createSurvey() {
    this.isSubmitted = true
    if (this.surveySvc.surveyData.title === '') {
      this.showTosterMessage('NoSurveyTitle')
      return
    }
    if (this.surveySvc.surveyData.title && this.surveySvc.surveyData.title.trim().length === 0) {
      this.showTosterMessage('titleSpaceOnly')
      return
    }
    if (this.surveySvc.surveyData.fields && this.surveySvc.surveyData.fields.length > 0) {
      var error = 0
      this.surveySvc.surveyData.fields.forEach((f: any) => {
        if (f.fieldType === 'radio' || f.fieldType === 'checkbox') {
          if (f.values.length === 0) {
            error = error + 1
          } else {
            f.values.forEach((v: any) => {
              if (!v.key) error = error + 1
            })
          }
        }
        if ((f.fieldType === 'star-rating' || f.fieldType === 'textarea') && f.name === 'New Question') {
          error = error + 1
        }
        if (!f.name || !f.fieldType || f.name === 'New Question') {
          error = error + 1
        }
      })
      if (error > 0) {
        this.showTosterMessage('fieldsRequried')
      } else {
        this.loaderService.changeLoad.next(true)
        this.surveySvc.createSurvey().subscribe(
          (_res: any) => {
            this.loaderService.changeLoad.next(false)
            this.showTosterMessage('success')
            this.router.navigate(['/author/surveys'])
          },
          (_err: any) => {
            this.loaderService.changeLoad.next(false)
            this.showTosterMessage('fail')
          })
      }
    }
  }

  showTosterMessage(type: string) {
    switch (type) {
      case 'success':
        if (!this.isEditMode) {
          this.openSnackbar('Survey is created successfully')
        } else {
          this.openSnackbar('Survey is updated successfully')
        }
        break
      case 'fail':
        this.openSnackbar('Survey creation failed')
        break
      case 'fieldsRequried':
        this.openSnackbar('Please fill all the required fields')
        break
      case 'NoSurveyTitle':
        this.openSnackbar('Survey title is required')
        break
      case 'titleSpaceOnly':
        this.openSnackbar('Proper survey title is required')
        break
      case 'surveyMinQuest':
        this.openSnackbar('Minimum 1 questions is required')
        break
      case 'surveyQuestSaved':
        this.openSnackbar('Question is saved successfully')
        break
    }
  }

  reset() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: 'auto',
      data: 'resetSurvey',
    })
    dialogRef.afterClosed().subscribe(async confirmDialogRes => {
      if (confirmDialogRes) {
        this.loaderService.changeLoad.next(true)
        this.surveySvc.resetSurveyData()
        this.surveyForm.reset()
        this.updateLocalFromStore()
        this.selectedQuestionNode = ''
        this.loaderService.changeLoad.next(false)
      }
    })
  }

  removeSurvey(item: string, data: any) {
    const selctedQuesID = data && data.identifier ? data.identifier : this.selectedQuestionNode
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: 'auto',
      data: item,
    })
    dialogRef.afterClosed().subscribe(async confirmDialogRes => {
      if (confirmDialogRes) {
        this.surveySvc.surveyData.fields.forEach((element: any, index: number) => {
          if (element.identifier === selctedQuesID) {
            this.surveySvc.deleteFieldByIndex(index)
            if (index !== -1) {
              this.questionList.splice(index, 1)
              if (this.questionList && this.questionList.length > 0) {
                const field = this.questionList[index] || this.questionList[index - 1] || this.questionList[index + 1]
                this.questionSelected(field, true)
              }
            }
          }
        })
        this.loaderService.changeLoad.next(true)
        // this.questionList = this.questionList.filter((v: any, index: any) => v.identifier !== this.selectedQuestionNode})
        if (this.questionList && this.questionList.length <= 0) {
          this.selectedQuestionNode = ''
          this.questionType = ''
          this.questionText = ''
        }
        this.loaderService.changeLoad.next(false)
      }
    })
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  filterData() {
    let searchValue = this.searchValue.toLowerCase()
    this.questionList = this.surveySvc.surveyData.fields.filter((v: any) => v.name.toLowerCase().match(searchValue))
    this.questionSelected(this.questionList.length > 0 ? this.questionList[0] : [], false)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questionList, event.previousIndex, event.currentIndex)
    this.questionSelected(this.questionList[event.currentIndex], false)
  }

  // Only AlphaNumeric with Some Characters [-_ ]
  // keyPressAlphaNumeric(event: any) {
  //   var inp = String.fromCharCode(event.keyCode);
  //   // Allow numbers, alpahbets, space, underscore
  //   if (/[a-zA-Z0-9-? ]/.test(inp)) {
  //     return true;
  //   } else {
  //     event.preventDefault();
  //     return false;
  //   }
  // }

}
