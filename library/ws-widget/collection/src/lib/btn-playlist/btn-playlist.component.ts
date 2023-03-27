import { Component, HostBinding, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { NsContent } from '../_services/widget-content.model'
import { BtnPlaylistDialogComponent } from './btn-playlist-dialog/btn-playlist-dialog.component'
import { NsPlaylist } from './btn-playlist.model'
import { BtnPlaylistService } from './btn-playlist.service'

const VALID_PRIMARY_CATEGORY: NsContent.EPrimaryCategory[] = [
  NsContent.EPrimaryCategory.MODULE,
  NsContent.EPrimaryCategory.COURSE,
  NsContent.EPrimaryCategory.PROGRAM,
  NsContent.EPrimaryCategory.RESOURCE,
]

@Component({
  selector: 'ws-widget-btn-playlist',
  templateUrl: './btn-playlist.component.html',
  styleUrls: ['./btn-playlist.component.scss'],
})
export class BtnPlaylistComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsPlaylist.IBtnPlaylist> {
  @Input() widgetData!: NsPlaylist.IBtnPlaylist
  @Input() forPreview = false
  @HostBinding('id')
  public id = 'playlist-content'
  playlistsFetchStatus: TFetchStatus = 'none'
  playlists: NsPlaylist.IPlaylist[] = []
  selectedPlaylists: string[] = []
  isValidContent = false
  isPlaylistEnabled = false
  constructor(
    private dialog: MatDialog,
    private playlistSvc: BtnPlaylistService,
    private configSvc: ConfigurationsService,
  ) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isPlaylistEnabled = !this.configSvc.restrictedFeatures.has('playlist')
    }
    if (
      this.widgetData &&
      this.widgetData.primaryCategory && VALID_PRIMARY_CATEGORY.includes(this.widgetData.primaryCategory)
    ) {
      this.isValidContent = true
    }
  }

  getPlaylists(event: Event) {
    event.stopPropagation()
    this.playlistsFetchStatus = 'fetching'
    this.playlistSvc.getAllPlaylists().subscribe(
      (playlists: NsPlaylist.IPlaylist[]) => {
        this.playlists = playlists
        this.playlistsFetchStatus = 'done'
      },
      () => {
        this.playlistsFetchStatus = 'error'
      },
    )
  }

  openDialog() {
    if (!this.forPreview) {
      this.dialog.open(BtnPlaylistDialogComponent, {
        width: '600px',
        data: {
          contentId: this.widgetData.contentId,
          contentName: this.widgetData.contentName,
        },
      })
    }
  }
}
