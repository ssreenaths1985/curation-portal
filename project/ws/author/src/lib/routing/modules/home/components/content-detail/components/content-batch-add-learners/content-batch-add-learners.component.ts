import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { IRLearners, IOrgUser, IRes } from './iIRLearners.model'
import { OrgUserService } from '../../services/org-user.service'
// import { TFetchStatus } from '@ws-widget/utils'
// tslint:disable-next-line
import _ from 'lodash'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { WidgetContentService, IAuthorData } from '@ws-widget/collection/src/public-api'
import { MatSnackBar, MatSlideToggleChange } from '@angular/material'
import { LocalDataService } from '../../services/local-data.service'

@Component({
  selector: 'ws-auth-content-batch-add-learners',
  templateUrl: './content-batch-add-learners.component.html',
  styleUrls: ['./content-batch-add-learners.component.scss'],
})
export class ContentBatchAddLearnersComponent implements OnInit {
  usersList!: IOrgUser[]
  selectedUsersList: IOrgUser[] = []
  @ViewChildren('invited') components!: QueryList<any>
  invitedUsers: any[] = []
  constructor(
    public dialogRef: MatDialogRef<ContentBatchAddLearnersComponent>,
    private orgUserService: OrgUserService,
    private contentSvc: WidgetContentService,
    private configService: ConfigurationsService,
    private dataService: LocalDataService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: String[],
  ) {
    if (_.get(data, 'isEnrolmentActive')) {
      // this.getList()
      this.getInvitedList()
    } else {
      this.getInvitedList()
    }
  }

  ngOnInit() {

  }
  getList() {

    // this.usersList
    this.orgUserService.getOrgUsersList().subscribe((response: IRes) => {
      if (response.count) {
        this.usersList = _.chain(response.content).map(f => {
          if (f.organisations) {
            const org = _.first(_.filter(f.organisations, r => r.organisationId === this.configService.unMappedUser.rootOrgId) || [])
            if (_.get(org, 'roles') && _.some(_.get(org, 'roles'), r => (r || '').toUpperCase() === 'PUBLIC')) {
              return f
            }
            return null
          }
          return null
        }).compact().map(r => {

          return {
            email: _.get(r, 'profileDetails.personalDetails.primaryEmail') || _.get(r, 'email'),
            userId: _.get(r, 'userId'),

            mobile: _.get(r, 'phone') || _.get(r, 'maskedPhone'),
            // tslint:disable-next-line
            name: `${(_.get(r, 'profileDetails.personalDetails.firstname') || _.get(r, 'firstname'))} ${(_.get(r, 'usr.profileDetails.personalDetails.surname') || _.get(r, 'lastName'))}`,
          } as IOrgUser
        }).compact().value() as IOrgUser[]
      }

    })
  }
  getInvitedList() {
    const batchId = _.get(this.data, 'batchId')
    this.contentSvc.fetchLearners(batchId).subscribe(l => {
      if (l && l.length) {
        this.invitedUsers = _.map(l, (usr: any) => {
          return {
            name: `${usr.first_name} ${usr.last_name}`,
            authorType: usr.designation || 'Designation not available',
            designation: usr.designation || 'Designation not available',
            department: usr.department,
            profileImage: '', // need
            profileLink: usr.user_id,
            userId: usr.user_id,
            email: usr.email,
          }
        }) as IAuthorData[]
      }
      this.updateUsers()
      this.dataService.batchUsersCount({ batchId, learners: this.invitedUsers, count: (l || []).length })
    })

  }
  updateUsers() {
    if (!!!_.get(this.data, 'isEnrolmentActive')) {
      this.usersList = _.map(this.invitedUsers, u => {
        return {
          email: u.email,
          mobile: 'na',
          name: u.name,
          userId: u.userId,
        } as IOrgUser
      })
    }
  }
  removeUserFromBatch(userId: string) {
    const data = { userId, batchId: _.get(this.data, 'batchId'), courseId: _.get(this.data, 'courseId') }
    this.orgUserService.removeUserFromBatch({ request: data }).subscribe(res => {
      if (res) {
        this.snackBar.open('success!')
        setTimeout(() => { }, 1000)
        this.getInvitedList()
      }
    }, // tslint:disable-next-line
      (error) => {
        this.snackBar.open(_.get(error, 'params.errmsg') || 'Some error occured! Please try again.')
      })
  }
  addLearner(learner: IOrgUser) {
    // console.log(this.components.toArray())
    if (learner && learner.userId && !!_.get(this.data, 'isEnrolmentActive')) {
      // call save API
      const data = {
        request: {
          courseId: _.get(this.data, 'courseId'),
          batchId: _.get(this.data, 'batchId'),
          userId: learner.userId, // need to check
        },
      }
      this.orgUserService.addToBatch(data).subscribe(res => {
        if (res) {
          this.snackBar.open('Invite send Successfully')
          this.getInvitedList()
        }
        // tslint:disable-next-line
      }, (error: any) => {
        const idx = _.indexOf(this.invitedUsers, { userId: learner.userId })
        const elem = _.filter(this.components.toArray(), { id: `id-${learner.userId}` })
        if (elem && elem[0]) {
          elem[0].checked = false
        }
        if (idx > -1) {
          this.invitedUsers.slice(idx, 1)
        }
        this.snackBar.open(_.get(error, 'params.errmsg') || 'Some error occured! Please try again.Or user is already in another batch.')
      })
    }
  }
  close() {
    this.dialogRef.close({
      data: {
        ok: true,
        data: this.selectedUsersList,
      } as IRLearners,
    })
  }
  cancel() {
    this.dialogRef.close({
      data: {
        ok: false,
        data: [],
      } as IRLearners,
    })
  }
  isSelected(usr: IOrgUser) {
    if (usr) {
      return this.selectedUsersList.indexOf(usr) >= 0
    }
    return false
  }
  selectUsr(usr: IOrgUser) {
    if (usr) {
      this.selectedUsersList.pop() // for single entry as there is no support from backend
      this.selectedUsersList.push(usr)
    }
  }
  checked(userId: string) {
    if (userId) {
      return _.filter(this.invitedUsers, { userId }).length > 0
    } return false
  }
  changed($event: MatSlideToggleChange, user: any) {
    switch ($event.checked) {
      case true:
        this.addLearner({ email: user.email, mobile: user.mobile, name: user.name, userId: user.userId })
        break
      case false:
        this.removeUserFromBatch(user.userId)
        break
    }

  }

  onEnterkySearch(event: any) {
    let texval = ''
    if (event && event.target) {
      texval = event.target.value
    } else {
      texval = event.value
    }
    this.orgUserService.getUserSearchList(texval).subscribe((response: IRes) => {

      if (response.count) {
        this.usersList = _.chain(response.content).map(f => {
          if (f.roles) {
            const role = _.first(_.filter(f.roles, r => (r.role || '').toUpperCase() === 'PUBLIC') || [])
            if (role) {
              return f
            }
            return null
          }
          return null
        }).compact().map(r => {

          const a = _.get(r, 'organisations')
          return {
            orgName1: _.get(a[0], 'orgName'),
            email: _.get(r, 'profileDetails.personalDetails.primaryEmail') || _.get(r, 'email'),
            userId: _.get(r, 'userId'),
            mobile: _.get(r, 'phone') || _.get(r, 'maskedPhone'),
            // tslint:disable-next-line
            name: `${(_.get(r, 'profileDetails.personalDetails.firstname') || _.get(r, 'firstname'))} ${(_.get(r, 'usr.profileDetails.personalDetails.surname') || _.get(r, 'lastName'))}`,
          } as IOrgUser
        }).compact().value() as IOrgUser[]
      }
    })
  }
}
