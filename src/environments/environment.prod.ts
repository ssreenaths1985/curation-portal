const win: Readonly<any> = (window as { [key: string]: any })

export const environment = {
  production: true,
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
