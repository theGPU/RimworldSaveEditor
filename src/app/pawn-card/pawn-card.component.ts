import { Component, Input, OnInit } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatSliderChange } from '@angular/material/slider';
import { LoggerService as Logger } from '../services/logger.service';
import { SaveControllerService, PawnNameType } from '../services/saveController.service';
let xpath = require('xpath');

@Component({
  selector: 'app-pawn-card',
  templateUrl: './pawn-card.component.html',
  styleUrls: ['./pawn-card.component.scss']
})
export class PawnCardComponent implements OnInit {
  @Input() pawnId: string = "";
  public skills: {[key: string]: [string | null, number | null]} = {};
  public perks: any = [];

  public firstName: string = "";
  public nickname: string = "";
  public lastName: string = "";

  private pawnNode: any;

  constructor(private saveController: SaveControllerService) { }

  ngOnInit(): void {
    this.pawnNode = xpath.select("//skills/../../id[contains(text(), '"+this.pawnId+"')]/..", this.saveController.save);
    this.extractPawnName();
    this.extractPawnSkills();
  }

  private extractPawnName() {
    let nameElement: Element = xpath.select1("//skills/../../id[contains(text(), '"+this.pawnId+"')]/../name", this.saveController.save);
    this.firstName = nameElement.getElementsByTagName("first")[0].textContent as string;
    this.nickname = nameElement.getElementsByTagName("nick")[0].textContent as string;
    this.lastName = nameElement.getElementsByTagName("last")[0].textContent as string;
  }

  private extractPawnSkills() {
    let skillsElements : Element[] = xpath.select("//skills/../../id[contains(text(), '"+this.pawnId+"')]/../skills/skills/li", this.saveController.save);
    Logger.debug(skillsElements)
    for (let skillElement of skillsElements) {
      let def = skillElement.getElementsByTagName("def")[0].textContent as string;
      let passion = skillElement.getElementsByTagName("passion")[0]?.textContent;
      let level = skillElement.getElementsByTagName("level")[0]?.textContent;
      this.skills[def] = [passion != null ? passion : null, level != null ? Number(level) : null];
    }
    Logger.log("Skills for "+this.pawnId+":", this.skills);
  }

  public onNameInputBlur($event: Event) {
    let inputTag = ($event.target as Element).getAttribute("tag");
    let value = ($event.target as unknown as MatInput).value;
    //this.saveController.setPawnName(this.pawnId, inputTag == "first" ? PawnNameType.First : inputTag == "last" ? PawnNameType.Last : PawnNameType.Nick, value);

    if (inputTag == "first" && this.firstName != value ) {
      this.saveController.setPawnName(this.pawnId, PawnNameType.First, value);
      this.firstName = value;
    }
    else if (inputTag == "last" && this.lastName != value) {
      this.saveController.setPawnName(this.pawnId, PawnNameType.Last, value);
      this.lastName = value;
    }
    else if (inputTag == "nick" && this.nickname != value) {
      this.saveController.setPawnName(this.pawnId, PawnNameType.Nick, value);
      this.nickname = value;
    }
  }

  public onPassionButtonClick($event: Event, skill: string) {
    let img = $event.target as HTMLImageElement;
    let currentPassion = img.getAttribute("data-currentPassion");
    currentPassion = currentPassion == "MinorGray" ? currentPassion = "Minor" : currentPassion == "Minor" ? currentPassion = "Major" : currentPassion = "MinorGray";
    img.setAttribute("data-currentPassion", currentPassion);
    img.src = "/assets/img/passion/Passion"+currentPassion+".png";
    this.saveController.setPawnPassion(this.pawnId, skill, currentPassion);
  }

  public onSkillSliderChanged($event: MatSliderChange, skill: string) {
    this.saveController.setPawnSkillLevel(this.pawnId, skill, ($event.value as number).toString());
  }
}
