import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatSliderChange } from '@angular/material/slider';

import { LoggerService as Logger } from '../services/logger.service';
import { SaveControllerService, PawnNameType } from '../services/save-controller.service';
import { XpathService as xpath } from '../services/xpath.service';

@Component({
  selector: 'app-pawn-card',
  templateUrl: './pawn-card.component.html',
  styleUrls: ['./pawn-card.component.scss']
})
export class PawnCardComponent implements OnInit {
  @Input() pawnId: string = "";
  public perks: any = [];

  public firstName: string = "";
  public nickname: string = "";
  public lastName: string = "";

  private _skills: {[key: string]: [string | null, number | null]} | null = null;
  public get skills() {
    if (!this._skills)
      this._skills = this.saveController.getPawnSkillsData(this.pawnId);
    return this._skills;
  }

  constructor(private saveController: SaveControllerService, private changeDetection: ChangeDetectorRef) {
    //this.changeDetection.detach();
   }

  ngOnInit(): void {
    const pawnName = this.saveController.getPawnName(this.pawnId);
    this.firstName = pawnName[0];
    this.nickname = pawnName[1];
    this.lastName = pawnName[2];
    //this.changeDetection.detectChanges();
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
    console.time("passion");
    let img = $event.target as HTMLImageElement;
    let currentPassion = img.getAttribute("data-currentPassion");
    currentPassion = currentPassion == "MinorGray" ? currentPassion = "Minor" : currentPassion == "Minor" ? currentPassion = "Major" : currentPassion = "MinorGray";
    img.setAttribute("data-currentPassion", currentPassion);
    img.src = "assets/img/passion/Passion"+currentPassion+".png";
    this.saveController.setPawnPassion(this.pawnId, skill, currentPassion);
    console.timeEnd("passion")
  }

  public onSkillSliderChanged($event: MatSliderChange, skill: string) {
    console.time("skill");
    this.saveController.setPawnSkillLevel(this.pawnId, skill, ($event.value as number).toString());
    console.timeEnd("skill");
  }
}
