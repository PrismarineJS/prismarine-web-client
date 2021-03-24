export class UserInformation {
  constructor(username) {
    this.username = username
  }
}

export class FolderInformation {
  constructor(assetsDir) {
    this.assetsDir = assetsDir
  }
}

export default class GameConfiguration {
  constructor (userInfo, folderInfo) {
    this.userInfo = userInfo
    this.folderInfo = folderInfo
  }
}
