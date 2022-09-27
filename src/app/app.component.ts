import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DOMParser, XMLSerializer  } from 'xmldom';
let xpath = require('xpath');

import { LoggerService as Logger } from './services/logger.service';
import { SaveControllerService } from './services/saveController.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  public Instance: AppComponent = this;
  public title = 'RimworldSaveEditor';

  public fileName: string | null = null;
  public fileLoadingInProgress: boolean = false;

  constructor(private saveController: SaveControllerService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // this.onFileReadComplete(null);
  }

  public get getSave() {
    return this.saveController.save;
  }

  public get getPawnsIds() {
    return this.saveController.pawnsIds;
  }

  public get getSaveGameVersion() {
    return this.saveController.saveGameVersion;
  }

  public onDownloadSave() {
    let saveContent = new XMLSerializer().serializeToString(this.saveController.save as Node);
    const blob = new Blob([saveContent], { type: "application/octet-stream" });
    //const fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));

    const anchor = document.createElement('a');
    anchor.download = this.fileName as string;
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
    anchor.click();
    window.URL.revokeObjectURL(anchor.href);
    anchor.remove();
  }

  public onFileSelected($event: Event) {
    const element = $event.currentTarget as HTMLInputElement;
    const fileList: FileList = element.files as FileList;
    if (fileList?.length == 1) {
      const fileEntry = fileList[0];
      this.fileName = fileEntry.name;
      Logger.log('Picked filename:', this.fileName);
      let fileReader = new FileReader();
      fileReader.onload = (e) => { this.onFileContentReaded(fileReader.result as string); };

      this.fileLoadingInProgress = true;
      fileReader.readAsText(fileEntry);
    }
  }

  public onFileContentReaded(content: string) {
    Logger.log("File content readed");
    let parser = new DOMParser();
    let parseStartTime = new Date().getTime();
    this.saveController.save = parser.parseFromString(content, 'text/xml');
    Logger.log("Parse done in:", new Date().getTime() - parseStartTime, "ms");

    this.saveController.onSaveLoaded();
    this.onFileReadComplete();
  }

  public onFileReadComplete() {
    Logger.debug(this.saveController.save);
    this.fileLoadingInProgress = false;

    this.getPlayerFractionName();
    this.extractPawns();

    //this.names = ["1", "2", "3", "4", "5"];
  }

  private getPlayerFractionName() {
    const playerFactionDefName = xpath.select1("//playerFaction/factionDef/text()", this.saveController.save);
    const playerFactionId = xpath.select1("//factionManager/allFactions/li/def[contains(text(), '"+playerFactionDefName+"')]/../loadID/text()", this.saveController.save);
    this.saveController.playerFactionName = "Faction_"+playerFactionId;

    Logger.log("Player fraction: "+this.saveController.playerFactionName)
  }

  private extractPawns() {
    this.saveController.pawnsIds = xpath.select("//skills/../../faction[contains(text(), '"+this.saveController.playerFactionName+"')]/../id/text()", this.saveController.save);
    console.log(this.saveController.pawnsIds);
  }
}
