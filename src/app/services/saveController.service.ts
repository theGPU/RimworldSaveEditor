import {Injectable} from '@angular/core';
import { LoggerService as Logger } from './logger.service';
let xpath = require('xpath');

@Injectable({
  providedIn: 'root'
})
export class SaveControllerService {
  constructor() { }

  public save: Document | null = null;
  public saveGameVersion: string = "";
  public playerFactionName: string | null = null
  public pawnsIds: string[] = [];

  public onSaveLoaded() {
    this.saveGameVersion = xpath.select1("//meta/gameVersion/text()", this.save);
  }

  public setPawnName(pawnId: string, type: PawnNameType, value: string) {
    Logger.debug("Changing "+PawnNameType[type]+" name for pawn "+pawnId+" to "+value);
    let pawnNameNode: Element = xpath.select1("//skills/../../id[contains(text(), '"+pawnId+"')]/../name", this.save);
    let elementTypeName = type == PawnNameType.First ? "first" : type == PawnNameType.Last ? "last" : "nick";
    if (pawnNameNode.getElementsByTagName(elementTypeName).length == 1){
      pawnNameNode.getElementsByTagName(elementTypeName)[0].textContent = value;
    } else {
      let nameSubElement = this.save!.createElement(elementTypeName);
      nameSubElement.textContent = value;
      pawnNameNode.appendChild(nameSubElement);
    }
  }

  private getPawnSkillNode(pawnId: string, skill: string) {
    return xpath.select1("//skills/../../id[contains(text(), '"+pawnId+"')]/../skills/skills/li/def[contains(text(), '"+skill+"')]/..", this.save) as Element;
  }

  public setPawnPassion(pawnId: string, skill: string, passion: string) {
    Logger.debug("Changing "+pawnId+" passion for skill "+skill+" to "+passion);
    let pawnSkillNode = this.getPawnSkillNode(pawnId, skill);
    if (passion == "MinorGray") {
      if (pawnSkillNode.getElementsByTagName("passion").length == 1) {
        pawnSkillNode.removeChild(pawnSkillNode.getElementsByTagName("passion")[0]);
      }
    } else {
      if (pawnSkillNode.getElementsByTagName("passion").length == 0) {
        let newPassionElement = this.save!.createElement("passion");
        newPassionElement.textContent = passion;
        pawnSkillNode.appendChild(newPassionElement);
      } else {
        pawnSkillNode.getElementsByTagName("passion")[0].textContent = passion;
      }
    }
  }

  public setPawnSkillLevel(pawnId: string, skill: string, level: string) {
    Logger.debug("Changing "+pawnId+" skill "+skill+" to level "+level);
    let pawnSkillNode = this.getPawnSkillNode(pawnId, skill);
    if (pawnSkillNode.getElementsByTagName("level").length == 0) {
      let newSkillLevelElement = this.save!.createElement("level");
      pawnSkillNode.appendChild(newSkillLevelElement);
    }
    pawnSkillNode.getElementsByTagName("level")[0].textContent = level;
  }
}

export enum PawnNameType {
    First,
    Last,
    Nick
}
