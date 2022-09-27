import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawnCardComponent } from './pawn-card.component';

describe('PawnCardComponent', () => {
  let component: PawnCardComponent;
  let fixture: ComponentFixture<PawnCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PawnCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
