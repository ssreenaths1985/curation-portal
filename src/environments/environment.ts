// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const win: Readonly<any> = (window as { [key: string]: any })

export const environment: IEnvironment = {
  production: false,
  sitePath: win['env'] ? win['env']['sitePath'] : '',
  organisation: win['env'] ? win['env']['organisation'] : '',
  framework: win['env'] ? win['env']['framework'] : '',
  channelId: win['env'] ? win['env']['channelId'] : '',
  karmYogi: win['env'] ? win['env']['karmYogi'] : '',
  azureHost: win['env'] ? win['env']['azureHost'] : '',
  azureBucket: win['env'] ? win['env']['azureBucket'] : '',
  azureOldHost: win['env'] ? win['env']['azureOldHost'] : '',
  azureOldBuket: win['env'] ? win['env']['azureOldBuket'] : '',
  portalRoles: win['env'] ? win['env']['portalRoles'] : '',
  scromContentEndpoint: win['env'] ? win['env']['scromContentEndpoint'] : '',
  cbpPortal: win['env'] ? win['env']['cbpPortal'] : '',
  contentBucket: win['env'] ? win['env']['contentBucket'] : '',
  certImage: win['env'] ? win['env']['certImage'] : '',
  timeForContentQuality: win['env'] ? win['env']['timeForContentQuality'] : '',
}
interface IEnvironment {
  production: boolean
  sitePath: null | string
  organisation: string
  framework: string
  channelId: string
  karmYogi: string
  azureHost: string
  azureBucket: string
  azureOldHost: string
  azureOldBuket: string
  portalRoles: string[]
  scromContentEndpoint: string
  cbpPortal: string
  contentBucket: string
  certImage: string
  timeForContentQuality: number
}

/*
 * For easier debugging in development mode, you can import the    file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error' // Included with Angular CLI.x
