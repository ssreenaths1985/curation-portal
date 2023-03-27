import { Component, Input, OnInit } from '@angular/core'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { NsContent } from '../../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { CollectionResolverService } from './../../services/resolver.service'

@Component({
  selector: 'ws-auth-table-tree-label',
  templateUrl: './auth-table-tree-label.component.html',
  styleUrls: ['./auth-table-tree-label.component.scss'],
})
export class AuthTableTreeLabelComponent implements OnInit {
  @Input() identifier!: string
  @Input() id!: number
  @Input() isDragging = false
  @Input() isInvalid = false
  name = ''
  @Input() icon = ''
  resourceTyp: any = NsContent.EPrimaryCategory.RESOURCE
  TYPES = NsContent.EPrimaryCategory
  constructor(
    private storeService: EditorContentService,
    private resolverService: CollectionResolverService,
  ) {
  }

  ngOnInit() {
    this.storeService.onContentChange.subscribe(v => {
      if (v === this.identifier) {
        this.getUpdatedContent()
      }
    })
    this.getUpdatedContent()
  }

  getUpdatedContent() {
    const updatedMeta = this.storeService.getUpdatedMeta(this.identifier)
    this.resourceTyp = updatedMeta.primaryCategory
    this.name = updatedMeta.name
    this.icon = this.resolverService.getIcon(updatedMeta)
  }
}
