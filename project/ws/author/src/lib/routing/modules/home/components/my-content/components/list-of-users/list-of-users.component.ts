
import { Component, OnDestroy, OnInit, AfterViewInit, Output, EventEmitter, ViewChild } from '@angular/core'
import { MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
/* tslint:disable */
import _ from 'lodash'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { MyContentService } from '../../services/my-content.service'
import { environment } from '../../../../../../../../../../../../src/environments/environment'
/* tslint:enable */

export interface IUserListTable {
  fullName: string
  email: string
  role: string
}

@Component({
  selector: 'ws-auth-list-of-users',
  templateUrl: './list-of-users.component.html',
  styleUrls: ['./list-of-users.component.scss'],
})
export class ListOfUsersComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | null = null
  @Output() data = new EventEmitter<any>()

  private colors = [
    '#EB7181', // red
    '#306933', // green
    '#000000', // black
    '#3670B2', // blue
    '#4E9E87',
    '#7E4C8D',
  ]
  displayedColumns: string[] = ['Full Name', 'Email', 'Role', 'deleteEmployee']
  tableDataSource: any

  typeOfUser!: string
  circleColor!: string
  searchValue!: string
  completeTableData!: IUserListTable[]
  completeInactiveData!: IUserListTable[]
  listOfRoles = environment.portalRoles

  constructor(
    private configSvc: ConfigurationsService,
    private contentService: MyContentService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.typeOfUser = 'active'
    this.getUserListData()
  }

  actionBtn(actionType: string, id: string) {
    switch (actionType) {
      case 'createNew':
        this.data.emit({
          type: actionType,
        })
        break
      case 'existingUser':
        this.data.emit({
          type: actionType,
          userId: id,
        })
        break
    }
  }

  async getUserListData() {
    const tableElementData: IUserListTable[] = []
    const inactiveUsersData: IUserListTable[] = []
    this.loaderService.changeLoad.next(true)
    const requestPayload: NSApiRequest.ISearchUser = {
      request: {
        query: '',
        filters: {
          rootOrgId: (this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) ? this.configSvc.userProfile.rootOrgId : '',
        },
      },
    }
    const userDataRes = await this.contentService.getListOfUsersApi(requestPayload).toPromise().catch(_error => { })
    if (userDataRes && userDataRes.params && userDataRes.params.status.toLowerCase() === 'success') {
      if (userDataRes.result && userDataRes.result.response && userDataRes.result.response.count > 0) {
        userDataRes.result.response.content.forEach((element: any) => {
          const tableData: any = {
            // tslint:disable-next-line: prefer-template
            fullName: element.firstName + ' ' + element.lastName,
            email: element.maskedEmail,
            role: '',
            userId: element.userId,
          }
          element.organisations.forEach((orgEle: any) => {
            tableData.role = orgEle.roles
          })
          if (element.status === 1) {
            tableElementData.push(tableData)
          } else if (element.status === 0) {
            inactiveUsersData.push(tableData)
          }
        })
      }
      this.completeTableData = tableElementData
      this.completeInactiveData = inactiveUsersData
      this.checkCurrentActiveTab()
      this.loaderService.changeLoad.next(false)
    } else {
      this.loaderService.changeLoad.next(false)
      this.showToastMessage('fail')
    }
  }

  toggelTabAction(type: string) {
    switch (type) {
      case 'activeUsers':
        this.typeOfUser = 'active'
        this.checkCurrentActiveTab()
        break

      case 'inactiveUsers':
        this.typeOfUser = 'inactive'
        this.checkCurrentActiveTab()
        break
    }
  }

  checkCurrentActiveTab() {
    const randomIndex = Math.floor(Math.random() * Math.floor(this.colors.length))
    this.circleColor = this.colors[randomIndex]
    switch (this.typeOfUser) {
      case 'active':
        this.tableDataSource = new MatTableDataSource<IUserListTable>(this.completeTableData)
        this.tableDataSource.paginator = this.paginator
        break
      case 'inactive':
        this.tableDataSource = new MatTableDataSource<IUserListTable>(this.completeInactiveData)
        this.tableDataSource.paginator = this.paginator
        break
    }
  }

  showToastMessage(type: string) {
    switch (type) {
      case 'fail':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'success':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
    }
  }

  createInititals(name: string): string {
    let initials = ''
    const array = `${name} `.toString().split(' ')
    if (array[0] !== 'undefined' && typeof array[1] !== 'undefined') {
      initials += array[0].charAt(0)
      initials += array[1].charAt(0)
    } else {
      for (let i = 0; i < name.length; i += 1) {
        if (name.charAt(i) === ' ') {
          continue
        }

        if (name.charAt(i) === name.charAt(i)) {
          initials += name.charAt(i)

          if (initials.length === 2) {
            break
          }
        }
      }
    }
    return initials.toUpperCase()
  }

  filterData() {
    const filteredData = this.completeTableData.filter((v: any) => v.fullName.match(this.searchValue))
    this.tableDataSource = new MatTableDataSource<IUserListTable>(filteredData)
    this.tableDataSource.paginator = this.paginator
  }

  async deactiveOrActiveUser(data: any, actionType: string) {
    this.loaderService.changeLoad.next(true)
    const requestPayload: NSApiRequest.IBlockOrUnblockUser = {
      request: {
        userId: data.userId,
        requestedBy: (this.configSvc.userProfile) ? this.configSvc.userProfile.userId : '',
      },
    }
    switch (actionType) {
      case 'deactiveUser':
        const blockApiRes = await this.contentService.blockUserApi(requestPayload).toPromise().catch(_error => { })
        if (blockApiRes && blockApiRes.params && blockApiRes.params.status.toLowerCase() === 'success') {
          setTimeout(() => {
            this.getUserListData()
            this.showToastMessage('success')
            // tslint:disable-next-line: align
          }, 1500)
        } else {
          this.loaderService.changeLoad.next(false)
          this.showToastMessage('fail')
        }

        break
      case 'activateUser':
        const unblockApiRes = await this.contentService.unblockUserApi(requestPayload).toPromise().catch(_error => { })
        if (unblockApiRes && unblockApiRes.params && unblockApiRes.params.status.toLowerCase() === 'success') {
          setTimeout(() => {
            this.getUserListData()
            this.showToastMessage('success')
            // tslint:disable-next-line: align
          }, 1500)
        } else {
          this.loaderService.changeLoad.next(false)
          this.showToastMessage('fail')
        }
        break
    }
  }

}
