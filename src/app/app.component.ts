import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { LoggerService as Logger } from './services/logger.service';
import { SaveControllerService } from './services/save-controller.service';
import { XpathService as xpath } from './services/xpath.service';

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

  constructor(private saveController: SaveControllerService) { }

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
      this.saveController.reset();
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
    let save = parser.parseFromString(content, 'text/xml');
    Logger.log("Parse done in:", new Date().getTime() - parseStartTime, "ms");
    Logger.debug(save);
    this.saveController.loadSave(save);
    Logger.log("Save load done in:", new Date().getTime() - parseStartTime, "ms");
    this.fileLoadingInProgress = false;
  }
}
