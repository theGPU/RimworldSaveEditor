import { Injectable } from '@angular/core';

import { LoggerService as Logger } from './logger.service';
import { XpathService as xpath } from './xpath.service';

@Injectable({
  providedIn: 'root'
})
export class SaveControllerService {
  constructor() { }

  public save: Document | null = null;
  public saveGameVersion: string | null = null;
  public playerFactionName: string | null = null
  public pawnsIds: string[] = [];

  public nodesCache: CacheNodesContainer = new CacheNodesContainer();

  public reset() {
    this.save = null;
    this.saveGameVersion = null;
    this.playerFactionName = null;
    this.pawnsIds = [];
    this.nodesCache.reset();
  }

  public loadSave(save: Document) {
    this.save = save;
    this.saveGameVersion = xpath.select1(this.save!, "//meta/gameVersion/text()", this.save!).textContent as string;
    this.getPlayerFractionName();
    this.nodesCache.createCache(this.save, this.playerFactionName!);
    this.pawnsIds = Object.keys(this.nodesCache.pawns);
    console.log(this.nodesCache);
  }

  private getPlayerFractionName() {
    const playerFactionDefName = xpath.select1(this.save!, "//playerFaction/factionDef/text()", this.save!).textContent as string;
    const playerFactionId = xpath.select1(this.save!, "//factionManager/allFactions/li/def[contains(text(), '" + playerFactionDefName + "')]/../loadID/text()", this.save!).textContent as string;
    this.playerFactionName = "Faction_" + playerFactionId;

    Logger.log("Player faction: " + this.playerFactionName)
  }

  public getPawnName(pawnId: string) {
    const pawnNameNode = this.nodesCache.pawns[pawnId].nameElement;
    return [pawnNameNode.getElementsByTagName("first")[0].textContent as string, pawnNameNode.getElementsByTagName("nick")[0].textContent as string, pawnNameNode.getElementsByTagName("last")[0].textContent as string]
  }

  public setPawnName(pawnId: string, type: PawnNameType, value: string) {
    Logger.debug("Changing " + PawnNameType[type] + " name for pawn " + pawnId + " to " + value);
    const pawnNameNode = this.nodesCache.pawns[pawnId].nameElement;
    const elementTypeName = type == PawnNameType.First ? "first" : type == PawnNameType.Last ? "last" : "nick";
    if (pawnNameNode.getElementsByTagName(elementTypeName).length == 1) {
      pawnNameNode.getElementsByTagName(elementTypeName)[0].textContent = value;
    } else {
      const nameSubElement = this.save!.createElement(elementTypeName);
      nameSubElement.textContent = value;
      pawnNameNode.appendChild(nameSubElement);
    }
  }

  public getPawnSkillsData(pawnId: string) {
    const skills: {[key: string]: [string | null, number | null]} = {};
    for (const [skillDefName, skillElement] of Object.entries(this.nodesCache.pawns[pawnId].skillsElements)) {
      let passion = skillElement.getElementsByTagName("passion")[0]?.textContent;
      let level = skillElement.getElementsByTagName("level")[0]?.textContent;
      skills[skillDefName] = [passion != null ? passion : null, level != null ? Number(level) : null];
    }
    Logger.log("Skills for "+pawnId+":", skills);
    return skills;
  }

  public setPawnPassion(pawnId: string, skill: string, passion: string) {
    Logger.debug("Changing " + pawnId + " passion for skill " + skill + " to " + passion);
    let pawnSkillNode = this.nodesCache.pawns[pawnId].getSkillElement(skill);;
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
    Logger.debug("Changing " + pawnId + " skill " + skill + " to level " + level);
    let pawnSkillNode = this.nodesCache.pawns[pawnId].getSkillElement(skill);;
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

export class CacheNodesContainer {
  public pawns: { [id: string]: PawnCacheNodesContainer };

  public constructor() {
    this.reset();
    this.pawns = {};
  }

  public reset() {
    this.pawns = {};
  }

  public createCache(save: Document, playerFactionName: string) {
    this.extractPawns(save, playerFactionName);
  }

  private extractPawns(save: Document, playerFactionName: string) {
    let pawnsNodes = xpath.select(save, "//skills/../../faction[contains(text(), '" + playerFactionName + "')]/..", save);
    for (let pawn of pawnsNodes) {
      this.addPawn(pawn);
    }
  }

  private addPawn(pawn: Element) {
    this.pawns[pawn.getElementsByTagName("id")[0].textContent!] = new PawnCacheNodesContainer(pawn);
  }
}

export class PawnCacheNodesContainer {
  public pawnElement: Element;
  public nameElement: Element;
  public skillsElements: { [def: string]: Element } = {};

  public constructor(pawnElement: Element) {
    this.pawnElement = pawnElement;
    this.extractSkillsElements();
    this.nameElement = xpath.select1(this.pawnElement.ownerDocument, "name", this.pawnElement);
  }

  private extractSkillsElements() {
    let skillNodes = xpath.select(this.pawnElement.ownerDocument, "skills/skills/li", this.pawnElement);
    for (let skillNode of skillNodes) {
      this.addSkillElement(skillNode);
    }
  }

  private addSkillElement(element: Element) {
    this.skillsElements[element.getElementsByTagName("def")[0].textContent!] = element;
  }

  public getSkillElement(defName: string) {
    return this.skillsElements[defName];
  }
}
