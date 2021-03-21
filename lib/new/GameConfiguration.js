export class UserInformation {
  constructor(username) {
    this.username = username;
  }
}

export class GameInformation {
  constructor(isDemo, version, versionType, disableMultiplayer, disableChat) {
    this.isDemo = isDemo;
    this.version = version;
    this.versionType = versionType;
    this.disableMultiplayer = disableMultiplayer;
    this.disableChat = disableChat;
  }
}

export class FolderInformation {
  constructor(assetsDir) {
    this.assetsDir = assetsDir;
  }
}

export default class GameConfiguration {
  constructor(userInfo, gameInfo, folderInfo) {
    this.userInfo = userInfo;
    this.gameInfo = gameInfo;
    this.folderInfo = folderInfo;
  }
}